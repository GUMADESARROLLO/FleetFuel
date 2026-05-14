import { useEffect, useState, useMemo, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { getSession, requireAuth, isAdmin, logout } from '../lib/auth';
import { formatCurrency, formatDate } from '../lib/storage';
import { apiGetRegistros, apiGetUsuarios } from '../lib/api';
import type { RegistroCombustible, Session, Usuario } from '../lib/types';

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [registros, setRegistros] = useState<RegistroCombustible[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateDesde, setDateDesde] = useState<Date | null>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dateHasta, setDateHasta] = useState<Date | null>(new Date());
  const [filtroConductor, setFiltroConductor] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requireAuth();
    const sess = getSession();
    if (!sess || !isAdmin()) {
      window.location.href = '/login';
      return;
    }
    setSession(sess);
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      const [all, users] = await Promise.all([
        apiGetRegistros(),
        apiGetUsuarios(),
      ]);
      setRegistros(all);
      setUsuarios(users);
      setLoading(false);
    })();
  }, [session]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    let data = [...registros];
    if (dateDesde) {
      data = data.filter(r => new Date(r.fechaCreacion) >= new Date(dateDesde.getFullYear(), dateDesde.getMonth(), dateDesde.getDate()));
    }
    if (dateHasta) {
      data = data.filter(r => new Date(r.fechaCreacion) <= new Date(dateHasta.getFullYear(), dateHasta.getMonth(), dateHasta.getDate(), 23, 59, 59));
    }
    if (filtroConductor) {
      data = data.filter(r => r.userId === Number(filtroConductor));
    }
    return data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }, [registros, dateDesde, dateHasta, filtroConductor]);

  const metrics = useMemo(() => {
    const totalRegistros = filtered.length;
    const totalLitros = filtered.reduce((s, r) => s + (r.litros || 0), 0);
    const totalImporte = filtered.reduce((s, r) => s + (r.importeTotal || 0), 0);
    return { totalRegistros, totalLitros, totalImporte, conductores: usuarios.filter(u => u.role.toLowerCase().includes('conductor')).length };
  }, [filtered]);

  const porConductor = useMemo(() => {
    const map = new Map<number, { nombre: string; registros: number; litros: number; importe: number }>();
    filtered.forEach(r => {
      const u = usuarios.find(u => u.id === r.userId);
      const nombre = u?.nombre || String(r.userId);
      const existing = map.get(r.userId) || { nombre, registros: 0, litros: 0, importe: 0 };
      existing.registros++;
      existing.litros += r.litros || 0;
      existing.importe += r.importeTotal || 0;
      map.set(r.userId, existing);
    });
    return Array.from(map.values());
  }, [filtered]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!session) return null;

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
              <span className="text-xs text-text-muted hidden sm:block">{session.nombre}</span>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-white">{session.nombre.charAt(0)}</span>
              </div>
              <svg className={`w-4 h-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface border border-border rounded-xl shadow-2xl py-1 z-50">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-sm font-medium text-text truncate">{session.nombre}</p>
                  <p className="text-xs text-text-muted truncate">@{session.username}</p>
                </div>
                <a
                  href="/admin/usuarios"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-bg transition-colors touch-target"
                >
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Gestión de Usuarios
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

      <main className="px-4 py-4 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold font-display text-text">Panel de Administración</h1>
          <span className="text-sm text-text-muted font-medium">
            {dateDesde && dateHasta
              ? `Periodo: ${format(dateDesde, "d MMM'.' yyyy", { locale: es })} al ${format(dateHasta, "d MMM'.' yyyy", { locale: es })}`
              : 'Sin filtro de fecha'}
          </span>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs font-medium text-text-muted mb-1">Desde</label>
              <DatePicker
                selected={dateDesde}
                onChange={(d) => setDateDesde(d)}
                selectsStart
                startDate={dateDesde || undefined}
                endDate={dateHasta || undefined}
                locale={es}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha"
                className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
                wrapperClassName="w-full"
              />
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs font-medium text-text-muted mb-1">Hasta</label>
              <DatePicker
                selected={dateHasta}
                onChange={(d) => setDateHasta(d)}
                selectsEnd
                startDate={dateDesde || undefined}
                endDate={dateHasta || undefined}
                minDate={dateDesde || undefined}
                locale={es}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha"
                className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
                wrapperClassName="w-full"
              />
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs font-medium text-text-muted mb-1">Conductor</label>
              <select
                value={filtroConductor}
                onChange={e => setFiltroConductor(e.target.value)}
                className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent transition-colors"
              >
                <option value="">Todos</option>
                {usuarios.filter(u => u.role.toLowerCase().includes('conductor')).map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
            {(dateDesde || dateHasta || filtroConductor) && (
              <button
                onClick={() => { setDateDesde(null); setDateHasta(null); setFiltroConductor(''); }}
                className="h-10 px-4 text-sm text-text-muted hover:text-text border border-border rounded-lg hover:bg-surface transition-colors touch-target whitespace-nowrap"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-surface rounded-xl border border-border p-4">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Registros</p>
                <p className="text-2xl font-bold font-display text-text">{metrics.totalRegistros}</p>
              </div>
              <div className="bg-surface rounded-xl border border-border p-4">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Litros</p>
                <p className="text-2xl font-bold font-display text-text">{metrics.totalLitros.toFixed(1)} L</p>
              </div>
              <div className="bg-surface rounded-xl border border-border p-4">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Importe Total</p>
                <p className="text-2xl font-bold font-display text-accent">{formatCurrency(metrics.totalImporte)}</p>
              </div>
              <div className="bg-surface rounded-xl border border-border p-4">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Conductores</p>
                <p className="text-2xl font-bold font-display text-text">{metrics.conductores}</p>
              </div>
            </div>

            {porConductor.length > 0 && (
              <div className="bg-surface rounded-xl border border-border p-4 mb-6">
                <h2 className="text-sm font-bold text-text mb-3 uppercase tracking-wider">Por Conductor</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-text-muted font-medium">Conductor</th>
                        <th className="text-right py-2 px-4 text-text-muted font-medium">Registros</th>
                        <th className="text-right py-2 px-4 text-text-muted font-medium">Litros</th>
                        <th className="text-right py-2 pl-4 text-text-muted font-medium">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porConductor.map(c => (
                        <tr key={c.nombre} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-4 text-text font-medium">{c.nombre}</td>
                          <td className="py-2 px-4 text-right text-text">{c.registros}</td>
                          <td className="py-2 px-4 text-right text-text">{c.litros.toFixed(1)} L</td>
                          <td className="py-2 pl-4 text-right text-accent font-bold">{formatCurrency(c.importe)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-sm font-bold text-text uppercase tracking-wider">
                  Todos los Registros {filtered.length > 0 && <span className="text-text-muted font-normal">({filtered.length})</span>}
                </h2>
              </div>
              {filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-surface-2 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-text-muted">No hay registros en este período</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-bg/50">
                        <th className="text-left py-3 px-4 text-text-muted font-medium whitespace-nowrap">Fecha</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium whitespace-nowrap">Conductor</th>
                        <th className="text-left py-3 px-4 text-text-muted font-medium whitespace-nowrap">Vehículo</th>
                        <th className="text-right py-3 px-4 text-text-muted font-medium whitespace-nowrap">Litros</th>
                        <th className="text-right py-3 px-4 text-text-muted font-medium whitespace-nowrap">Importe</th>
                        <th className="text-center py-3 px-4 text-text-muted font-medium whitespace-nowrap">Sync</th>
                        <th className="py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(r => {
                        const conductor = usuarios.find(u => u.id === r.userId);
                        return (
                          <tr key={r.id} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                            <td className="py-3 px-4 text-text whitespace-nowrap">{formatDate(r.fechaCreacion)}</td>
                            <td className="py-3 px-4 text-text">{conductor?.nombre || String(r.userId)}</td>
                            <td className="py-3 px-4 text-text">{r.vehiculoNombre}</td>
                            <td className="py-3 px-4 text-right text-text whitespace-nowrap">{r.litros?.toFixed(1) || '0'} L</td>
                            <td className="py-3 px-4 text-right text-accent font-bold whitespace-nowrap">{formatCurrency(r.importeTotal || 0)}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block w-2 h-2 rounded-full ${r.sincronizado ? 'bg-success' : 'bg-accent'}`} />
                            </td>
                            <td className="py-3 px-4">
                              <a
                                href={`/reportes/${r.id}`}
                                className="text-accent hover:underline text-xs font-medium touch-target inline-flex items-center gap-1"
                              >
                                Ver
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
