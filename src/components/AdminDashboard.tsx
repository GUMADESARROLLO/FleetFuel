import { useEffect, useState, useMemo, useRef } from 'react';
import $ from 'jquery';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { getSession, requireAuth, isAdmin, logout } from '../lib/auth';
import { formatCurrency, formatLitros } from '../lib/storage';
import { apiGetRegistros, apiGetUsuarios, apiGetUnidadesNegocio } from '../lib/api';
import type { RegistroCombustible, Session, Usuario, UnidadNegocio } from '../lib/types';
import DataTable from './DataTable';

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [registros, setRegistros] = useState<RegistroCombustible[]>([]);
  const [loading, setLoading] = useState(true);
  const initDesde = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, []);
  const initHasta = useMemo(() => new Date(), []);
  const [dateDesde, setDateDesde] = useState<Date | null>(initDesde);
  const [dateHasta, setDateHasta] = useState<Date | null>(initHasta);
  const [filtroConductor, setFiltroConductor] = useState('');
  const [filtroUnidadNegocio, setFiltroUnidadNegocio] = useState('');
  const [appliedDateDesde, setAppliedDateDesde] = useState<Date | null>(initDesde);
  const [appliedDateHasta, setAppliedDateHasta] = useState<Date | null>(initHasta);
  const [appliedFiltroConductor, setAppliedFiltroConductor] = useState('');
  const [appliedFiltroUnidadNegocio, setAppliedFiltroUnidadNegocio] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [unidadesNegocio, setUnidadesNegocio] = useState<UnidadNegocio[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const [all, users, un] = await Promise.all([
        apiGetRegistros(),
        apiGetUsuarios(),
        apiGetUnidadesNegocio(),
      ]);
      setRegistros(all);
      setUsuarios(users);
      setUnidadesNegocio(un);
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

  useEffect(() => {
    if (!inputRef.current || !session) return;

    let picker: any;

    (async () => {
      const m = await import('moment');
      (window as any).moment = m.default || m;

      (window as any).jQuery = $;

      await import('daterangepicker');

      if (!inputRef.current) return;

      const $input = $(inputRef.current);
      const now = new Date();

      $input.daterangepicker({
        autoApply: true,
        ranges: {
          'Hoy': [new Date(), new Date()],
          'Últm. 7 Días': [new Date(now.getTime() - 6 * 86400000), new Date()],
          'Últm. 30 Días': [new Date(now.getTime() - 29 * 86400000), new Date()],
          'Este Mes': [new Date(now.getFullYear(), now.getMonth(), 1), new Date()],
          'Mes Anterior': [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)],
          "3 Meses": [new Date(now.getFullYear(), now.getMonth() - 3, 1), new Date()],
          "6 Meses": [new Date(now.getFullYear(), now.getMonth() - 6, 1), new Date()],
          '1 Año': [new Date(now.getFullYear() - 1, now.getMonth(), 1), new Date()],
        },
        showCustomRangeLabel: false,
        alwaysShowCalendars: true,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(),
        opens: 'left',
        locale: {
          format: "D MMM. YYYY",
          separator: " - ",
          applyLabel: "Aplicar",
          cancelLabel: "Cancelar",
          fromLabel: "Desde",
          toLabel: "Hasta",
          customRangeLabel: "Personalizado",
          weekLabel: "S",
          daysOfWeek: ["Dom.", "Lun.", "Mar.", "Mie.", "Jue.", "Vie", "Sab."],
          monthNames: [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ],
          firstDay: 1
        }
      }, function(start: any, end: any) {
        setDateDesde(start.toDate());
        setDateHasta(end.toDate());
      });

      picker = $input.data('daterangepicker');
    })();

    return () => {
      if (picker) picker.remove();
    };
  }, [session]);

  const filtered = useMemo(() => {
    let data = [...registros];
    if (appliedDateDesde) {
      data = data.filter(r => new Date(r.fechaCreacion) >= new Date(appliedDateDesde.getFullYear(), appliedDateDesde.getMonth(), appliedDateDesde.getDate()));
    }
    if (appliedDateHasta) {
      data = data.filter(r => new Date(r.fechaCreacion) <= new Date(appliedDateHasta.getFullYear(), appliedDateHasta.getMonth(), appliedDateHasta.getDate(), 23, 59, 59));
    }
    if (appliedFiltroConductor) {
      data = data.filter(r => r.userId === Number(appliedFiltroConductor));
    }
    if (appliedFiltroUnidadNegocio) {
      const ids = new Set(usuarios.filter(u => String(u.unidadNegocioId) === appliedFiltroUnidadNegocio).map(u => u.id));
      data = data.filter(r => ids.has(r.userId));
    }
    return data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }, [registros, appliedDateDesde, appliedDateHasta, appliedFiltroConductor, appliedFiltroUnidadNegocio, usuarios]);

  const metrics = useMemo(() => {
    const totalRegistros = filtered.length;
    const totalLitros = filtered.reduce((s, r) => s + (r.litros || 0), 0);
    const totalImporte = filtered.reduce((s, r) => s + (r.importeTotal || 0), 0);
    return { totalRegistros, totalLitros, totalImporte, conductores: usuarios.filter(u => u.role.toLowerCase().includes('conductor')).length };
  }, [filtered]);

  const porConductor = useMemo(() => {
    const map = new Map<number, { nombre: string; unidadNegocioNombre: string; registros: number; litros: number; importe: number }>();
    filtered.forEach(r => {
      const u = usuarios.find(u => u.id === r.userId);
      const nombre = u?.nombre || String(r.userId);
      const unNombre = u?.unidadNegocioNombre || '';
      const existing = map.get(r.userId) || { nombre, unidadNegocioNombre: unNombre, registros: 0, litros: 0, importe: 0 };
      existing.registros++;
      existing.litros += r.litros || 0;
      existing.importe += r.importeTotal || 0;
      map.set(r.userId, existing);
    });
    return Array.from(map.values());
  }, [filtered, usuarios]);

  const porUnidad = useMemo(() => {
    const map = new Map<string, { nombre: string; registros: number; litros: number; importe: number }>();
    filtered.forEach(r => {
      const u = usuarios.find(u => u.id === r.userId);
      const unId = String(u?.unidadNegocioId || '0');
      const unNombre = u?.unidadNegocioNombre || 'Sin unidad';
      const existing = map.get(unId) || { nombre: unNombre, registros: 0, litros: 0, importe: 0 };
      existing.registros++;
      existing.litros += r.litros || 0;
      existing.importe += r.importeTotal || 0;
      map.set(unId, existing);
    });
    return Array.from(map.values());
  }, [filtered, usuarios]);

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
            <a href="/admin/dashboard" className="font-display font-bold text-lg text-text hover:text-accent transition-colors">Admin FleetFuel</a>
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
                  Usuarios
                </a>
                <a
                  href="/admin/catalogos"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-bg transition-colors touch-target"
                >
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      <main className="px-4 py-4 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold font-display text-text">Panel de Administración</h1>
          <span className="text-sm text-text-muted font-medium">
            {appliedDateDesde && appliedDateHasta
              ? `Periodo: ${format(appliedDateDesde, "d MMM'.' yyyy", { locale: es })} al ${format(appliedDateHasta, "d MMM'.' yyyy", { locale: es })}`
              : 'Sin filtro de fecha'}
          </span>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 mb-6">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-6 sm:col-span-3">
              <label className="block text-xs font-medium text-text-muted mb-1">Rango de Fechas</label>
              <input
                ref={inputRef}
                name="dt_range"
                type="text"
                className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
                readOnly
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
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
            <div className="col-span-6 sm:col-span-3">
              <label className="block text-xs font-medium text-text-muted mb-1">Unidad de Negocio</label>
              <select
                value={filtroUnidadNegocio}
                onChange={e => setFiltroUnidadNegocio(e.target.value)}
                className="w-full h-10 px-3 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent transition-colors"
              >
                <option value="">Todas</option>
                {unidadesNegocio.filter(u => u.activo).map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-span-6 sm:col-span-3 flex items-end">
              <button
                onClick={() => {
                  setAppliedDateDesde(dateDesde);
                  setAppliedDateHasta(dateHasta);
                  setAppliedFiltroConductor(filtroConductor);
                  setAppliedFiltroUnidadNegocio(filtroUnidadNegocio);
                  if (!session) return;
                  setLoading(true);
                  Promise.all([apiGetRegistros(), apiGetUsuarios(), apiGetUnidadesNegocio()]).then(([all, users, un]) => {
                    setRegistros(all);
                    setUsuarios(users);
                    setUnidadesNegocio(un);
                    setLoading(false);
                  });
                }}
                className="w-full h-10 px-3 text-sm text-text-muted hover:text-text border border-border rounded-lg hover:bg-surface transition-colors touch-target whitespace-nowrap flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
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

            {porUnidad.length > 0 && (
              <div className="bg-surface rounded-xl border border-border p-4 mb-6">
                <h2 className="text-sm font-bold text-text mb-3 uppercase tracking-wider">Gasto por Unidad de Negocio</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-text-muted font-medium">Unidad</th>
                        <th className="text-right py-2 px-4 text-text-muted font-medium">Registros</th>
                        <th className="text-right py-2 px-4 text-text-muted font-medium">Litros</th>
                        <th className="text-right py-2 pl-4 text-text-muted font-medium">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porUnidad.map(u => (
                        <tr key={u.nombre} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-4 text-text font-medium">{u.nombre}</td>
                          <td className="py-2 px-4 text-right text-text">{u.registros}</td>
                          <td className="py-2 px-4 text-right text-text whitespace-nowrap">{formatLitros(u.litros)}</td>
                          <td className="py-2 pl-4 text-right text-accent font-bold">{formatCurrency(u.importe)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {porConductor.length > 0 && (
              <div className="bg-surface rounded-xl border border-border p-4 mb-6">
                <h2 className="text-sm font-bold text-text mb-3 uppercase tracking-wider">Por Conductor</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-text-muted font-medium">Conductor</th>
                        <th className="text-left py-2 px-4 text-text-muted font-medium">Unidad de Negocio</th>
                        <th className="text-right py-2 px-4 text-text-muted font-medium">Registros</th>
                        <th className="text-right py-2 px-4 text-text-muted font-medium">Litros</th>
                        <th className="text-right py-2 pl-4 text-text-muted font-medium">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porConductor.map(c => (
                        <tr key={c.nombre} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-4 text-text font-medium">{c.nombre}</td>
                          <td className="py-2 px-4 text-text">{c.unidadNegocioNombre || '—'}</td>
                          <td className="py-2 px-4 text-right text-text">{c.registros}</td>
                          <td className="py-2 px-4 text-right text-text whitespace-nowrap">{formatLitros(c.litros)}</td>
                          <td className="py-2 pl-4 text-right text-accent font-bold whitespace-nowrap">{formatCurrency(c.importe)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DataTable
              dateDesde={appliedDateDesde}
              dateHasta={appliedDateHasta}
              filtroConductor={appliedFiltroConductor}
              filtroUnidadNegocio={appliedFiltroUnidadNegocio}
            />
          </>
        )}
      </main>
    </div>
  );
}
