import { useEffect, useState } from 'react';
import { getSession, requireAuth, isAdmin } from '../lib/auth';
import { apiGetUsuarios, apiCreateUsuario, apiUpdateUsuario, apiDeleteUsuario } from '../lib/api';
import type { Usuario } from '../lib/types';

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ username: '', nombre: '', password: '', role: 'conductor' as 'admin' | 'conductor' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    requireAuth();
    if (!getSession() || !isAdmin()) {
      window.location.href = '/login';
      return;
    }
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    try {
      const data = await apiGetUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      console.error('Error loading usuarios:', err);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ username: '', nombre: '', password: '', role: 'conductor' });
    setError('');
    setShowModal(true);
  }

  function openEdit(u: Usuario) {
    setEditing(u);
    setForm({ username: u.username, nombre: u.nombre, password: '', role: u.role });
    setError('');
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editing) {
        const payload: Partial<Usuario> = { nombre: form.nombre, role: form.role };
        if (form.password) payload.password = form.password;
        await apiUpdateUsuario(editing.username, payload);
      } else {
        await apiCreateUsuario(form);
      }
      setShowModal(false);
      await loadUsuarios();
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function handleDelete(username: string) {
    if (!confirm(`¿Eliminar usuario "${username}"?`)) return;
    try {
      await apiDeleteUsuario(username);
      await loadUsuarios();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
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

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <a
              href="/admin/dashboard"
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface transition-colors touch-target"
            >
              <svg className="w-5 h-5 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <span className="font-display font-bold text-lg text-text">Gestión de Usuarios</span>
          </div>
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
      </header>

      <main className="px-4 py-4 max-w-4xl mx-auto">
        {usuarios.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <svg className="w-12 h-12 text-surface-2 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-sm text-text-muted">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg/50">
                    <th className="text-left py-3 px-4 text-text-muted font-medium">Usuario</th>
                    <th className="text-left py-3 px-4 text-text-muted font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 text-text-muted font-medium">Rol</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.username} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                      <td className="py-3 px-4 text-text font-medium">@{u.username}</td>
                      <td className="py-3 px-4 text-text">{u.nombre}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-accent/15 text-accent'
                            : 'bg-primary/15 text-primary'
                        }`}>
                          {u.role === 'admin' ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                          {u.role === 'admin' ? 'Admin' : 'Conductor'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(u)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors text-text-muted hover:text-accent touch-target"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {u.username !== 'admin' && (
                            <button
                              onClick={() => handleDelete(u.username)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors text-text-muted hover:text-danger touch-target"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold text-text text-lg">
                {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
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
                <label className="block text-sm font-medium text-text-muted mb-1">Usuario</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  disabled={!!editing}
                  className="w-full h-11 px-3 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:opacity-40"
                  placeholder="Nombre de usuario"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full h-11 px-3 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  Contraseña {editing && <span className="text-text-muted/50 font-normal">(dejar vacío para mantener)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full h-11 px-3 bg-bg border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder={editing ? 'Nueva contraseña' : 'Contraseña'}
                  required={!editing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Rol</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'conductor' }))}
                  className="w-full h-11 px-3 bg-bg border border-border rounded-xl text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                >
                  <option value="conductor">Conductor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

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
                  ) : editing ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
