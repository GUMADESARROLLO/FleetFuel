import { useEffect, useState, useRef } from 'react';
import { getSession, requireAuth, isAdmin, logout } from '../lib/auth';
import {
  apiGetVehiculos, apiCreateVehiculo, apiUpdateVehiculo, apiDeleteVehiculo,
  apiGetTiposCombustible, apiCreateTipoCombustible, apiUpdateTipoCombustible, apiDeleteTipoCombustible,
  apiGetProveedores, apiCreateProveedor, apiUpdateProveedor, apiDeleteProveedor,
  apiGetSubProyectos, apiCreateSubProyecto, apiUpdateSubProyecto, apiDeleteSubProyecto,
} from '../lib/api';
import type { Vehiculo, TipoCombustible, Proveedor, SubProyecto, Session } from '../lib/types';

interface CatalogTab {
  id: string;
  label: string;
  icon: JSX.Element;
}

const TABS: CatalogTab[] = [
  {
    id: 'vehiculos',
    label: 'Vehículos',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'tipos-combustible',
    label: 'Combustibles',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 7 6 11 6 14a6 6 0 1012 0c0-3-3-7-6-12z" />
      </svg>
    ),
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'sub-proyectos',
    label: 'Sub Proyectos',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
];

type CatalogItem = { id: string | number; nombre: string } & Record<string, any>;

export default function AdminCatalogos() {
  const [session, setSession] = useState<Session | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('vehiculos');
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tipos, setTipos] = useState<TipoCombustible[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [subProyectos, setSubProyectos] = useState<SubProyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<{ id: string | number; nombre: string; placa?: string } | null>(null);
  const [form, setForm] = useState({ id: '', nombre: '', placa: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    requireAuth();
    const sess = getSession();
    if (!sess || !isAdmin()) {
      window.location.href = '/login';
      return;
    }
    setSession(sess);
    loadAll();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  async function loadAll() {
    try {
      const [v, t, p, s] = await Promise.all([
        apiGetVehiculos(),
        apiGetTiposCombustible(),
        apiGetProveedores(),
        apiGetSubProyectos(),
      ]);
      setVehiculos(v);
      setTipos(t);
      setProveedores(p);
      setSubProyectos(s);
    } catch (err: any) {
      console.error('Error loading catalogs:', err);
    }
    setLoading(false);
  }

  function getItems(): CatalogItem[] {
    switch (activeTab) {
      case 'vehiculos': return vehiculos;
      case 'tipos-combustible': return tipos;
      case 'proveedores': return proveedores;
      case 'sub-proyectos': return subProyectos;
      default: return [];
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ id: '', nombre: '', placa: '' });
    setError('');
    setShowModal(true);
  }

  function openEdit(item: CatalogItem) {
    setEditing({ id: item.id, nombre: item.nombre, placa: item.placa });
    setForm({ id: String(item.id), nombre: item.nombre, placa: item.placa || '' });
    setError('');
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editing) {
        switch (activeTab) {
          case 'vehiculos':
            await apiUpdateVehiculo({ id: String(editing.id), nombre: form.nombre, placa: form.placa });
            break;
          case 'tipos-combustible':
            await apiUpdateTipoCombustible(Number(editing.id), form.nombre);
            break;
          case 'proveedores':
            await apiUpdateProveedor(Number(editing.id), form.nombre);
            break;
          case 'sub-proyectos':
            await apiUpdateSubProyecto(Number(editing.id), form.nombre);
            break;
        }
      } else {
        switch (activeTab) {
          case 'vehiculos':
            await apiCreateVehiculo({ nombre: form.nombre, placa: form.placa });
            break;
          case 'tipos-combustible':
            await apiCreateTipoCombustible(form.nombre);
            break;
          case 'proveedores':
            await apiCreateProveedor(form.nombre);
            break;
          case 'sub-proyectos':
            await apiCreateSubProyecto(form.nombre);
            break;
        }
      }
      setShowModal(false);
      await loadAll();
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function handleDelete(item: CatalogItem) {
    const label = item.nombre || item.id;
    if (!confirm(`¿Eliminar "${label}"?`)) return;
    try {
      switch (activeTab) {
        case 'vehiculos':
          await apiDeleteVehiculo(String(item.id));
          break;
        case 'tipos-combustible':
          await apiDeleteTipoCombustible(Number(item.id));
          break;
        case 'proveedores':
          await apiDeleteProveedor(Number(item.id));
          break;
        case 'sub-proyectos':
          await apiDeleteSubProyecto(Number(item.id));
          break;
      }
      await loadAll();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  function getModalTitle() {
    const tabLabel = TABS.find(t => t.id === activeTab)?.label || '';
    return editing ? `Editar ${tabLabel}` : `Nuevo ${tabLabel}`;
  }

  function getDisplayName(item: CatalogItem): string {
    return item.nombre;
  }

  function getExtraInfo(item: CatalogItem): string {
    if (activeTab === 'vehiculos') return item.placa || '';
    if (activeTab === 'vehiculos' && item.activo === 0) return 'Inactivo';
    return '';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <svg className="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const items = getItems();

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 h-14 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C9 7 6 11 6 14a6 6 0 1012 0c0-3-3-7-6-12z" />
            </svg>
            <span className="font-display font-bold text-lg text-text">Admin FleetFuel</span>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface transition-colors touch-target"
            >
              <span className="text-xs text-text-muted hidden sm:block">{session?.nombre}</span>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-white">{session?.nombre.charAt(0)}</span>
              </div>
              <svg className={`w-4 h-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface border border-border rounded-xl shadow-2xl py-1 z-50">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-sm font-medium text-text truncate">{session?.nombre}</p>
                  <p className="text-xs text-text-muted truncate">@{session?.username}</p>
                </div>
                <a
                  href="/admin/usuarios"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-bg transition-colors touch-target"
                >
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Usuarios
                </a>
                <a
                  href="/admin/catalogos"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-bg transition-colors touch-target"
                >
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Catálogos
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-bg transition-colors touch-target"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-14 z-20 bg-bg/95 backdrop-blur-lg border-b border-border">
        <nav className="flex max-w-4xl mx-auto overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 h-11 text-sm font-medium border-b-2 transition-colors touch-target whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-muted hover:text-text hover:border-border'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="px-4 py-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider">
            {TABS.find(t => t.id === activeTab)?.label || ''}
          </h2>
          <button
            onClick={openCreate}
            className="h-9 px-4 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-lg transition-colors touch-target flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo
          </button>
        </div>
        {items.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <svg className="w-12 h-12 text-surface-2 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm text-text-muted">No hay registros</p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg/50">
                    <th className="text-left py-3 px-4 text-text-muted font-medium">Nombre</th>
                    {activeTab === 'vehiculos' && (
                      <th className="text-left py-3 px-4 text-text-muted font-medium">Placa</th>
                    )}
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={String(item.id)} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                      <td className="py-3 px-4 text-text font-medium">{getDisplayName(item)}</td>
                      {activeTab === 'vehiculos' && (
                        <td className="py-3 px-4">
                          <span className={`text-sm ${item.activo === 0 ? 'text-text-muted line-through' : 'text-text'}`}>
                            {item.placa || ''}
                          </span>
                          {item.activo === 0 && (
                            <span className="ml-2 text-xs text-danger font-medium">Inactivo</span>
                          )}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors text-text-muted hover:text-accent touch-target"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors text-text-muted hover:text-danger touch-target"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inactive vehicles hint */}
        {activeTab === 'vehiculos' && vehiculos.filter(v => v.activo === 0).length > 0 && (
          <p className="text-xs text-text-muted mt-3 text-center">
            Los vehículos eliminados se marcan como inactivos y se ocultan en los formularios de registro.
          </p>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold text-text text-lg">{getModalTitle()}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors text-text-muted hover:text-text touch-target"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full h-11 px-3 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="Nombre"
                  required
                />
              </div>

              {activeTab === 'vehiculos' && (
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Placa</label>
                  <input
                    type="text"
                    value={form.placa}
                    onChange={e => setForm(f => ({ ...f, placa: e.target.value }))}
                    className="w-full h-11 px-3 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    placeholder="Ej: ABC-123"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl">
                  <p className="text-sm text-danger font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 border border-border rounded-xl text-text-muted hover:text-text hover:bg-bg transition-colors font-medium text-sm touch-target"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm touch-target"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Guardando...
                    </>
                  ) : editing ? 'Guardar Cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
