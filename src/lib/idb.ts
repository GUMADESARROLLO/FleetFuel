import type { RegistroCombustible } from './types';

const DB_NAME = 'fleetfuel';
const DB_VERSION = 1;
const STORE_NAME = 'registros';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRegistroDB(registro: RegistroCombustible): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(registro);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllRegistrosDB(userId?: string): Promise<RegistroCombustible[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as RegistroCombustible[];
      resolve(userId ? all.filter(r => r.userId === userId) : all);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getRegistroByIdDB(id: string): Promise<RegistroCombustible | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as RegistroCombustible | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function updateSyncStatusBatchDB(ids: string[], sincronizado: boolean): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let completed = 0;
    ids.forEach((id) => {
      const req = store.get(id);
      req.onsuccess = () => {
        const record = req.result as RegistroCombustible | undefined;
        if (record) {
          record.sincronizado = sincronizado;
          store.put(record);
        }
        completed++;
        if (completed === ids.length) {
          resolve();
        }
      };
      req.onerror = () => {
        completed++;
        if (completed === ids.length) {
          resolve();
        }
      };
    });
    if (ids.length === 0) resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllRegistrosDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
