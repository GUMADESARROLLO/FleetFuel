import { useEffect, useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { getSession, requireAuth } from '../lib/auth';
import {
  getRegistros,
  formatCurrency,
  formatDate,
} from '../lib/storage';
import type { RegistroCombustible } from '../lib/types';
import ReportCard from './ReportCard';

export default function ReportesList() {
  const [session, setSession] = useState<any>(null);
  const [registros, setRegistros] = useState<RegistroCombustible[]>([]);
  const [dateDesde, setDateDesde] = useState<Date | null>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dateHasta, setDateHasta] = useState<Date | null>(new Date());

  useEffect(() => {
    requireAuth();
    const sess = getSession();
    if (!sess) return;
    setSession(sess);

    (async () => {
      const all = await getRegistros(sess.id);
      setRegistros(all);
    })();
  }, []);

  const filtered = useMemo(() => {
    let data = [...registros];
    if (dateDesde) {
      data = data.filter(r => new Date(r.fechaCreacion) >= new Date(dateDesde.getFullYear(), dateDesde.getMonth(), dateDesde.getDate()));
    }
    if (dateHasta) {
      data = data.filter(r => new Date(r.fechaCreacion) <= new Date(dateHasta.getFullYear(), dateHasta.getMonth(), dateHasta.getDate(), 23, 59, 59));
    }
    return data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }, [registros, dateDesde, dateHasta]);

  const totalLitros = useMemo(() => filtered.reduce((s, r) => s + (r.litros || 0), 0), [filtered]);
  const totalImporte = useMemo(() => filtered.reduce((s, r) => s + (r.importeTotal || 0), 0), [filtered]);

  if (!session) return null;

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-display text-text">Mis Reportes</h2>
        {(dateDesde || dateHasta) && (
          <button
            onClick={() => { setDateDesde(null); setDateHasta(null); }}
            className="text-xs text-text-muted hover:text-text transition-colors touch-target px-2"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border p-3 mb-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-text-muted mb-1 uppercase">Desde</label>
            <DatePicker
              selected={dateDesde}
              onChange={(d) => setDateDesde(d)}
              selectsStart
              startDate={dateDesde || undefined}
              endDate={dateHasta || undefined}
              locale={es}
              dateFormat="dd/MM/yyyy"
              placeholderText="Fecha inicial"
              className="w-full h-9 px-2 bg-bg border border-border rounded-lg text-text text-xs focus:outline-none focus:border-accent transition-colors cursor-pointer"
              wrapperClassName="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-text-muted mb-1 uppercase">Hasta</label>
            <DatePicker
              selected={dateHasta}
              onChange={(d) => setDateHasta(d)}
              selectsEnd
              startDate={dateDesde || undefined}
              endDate={dateHasta || undefined}
              minDate={dateDesde || undefined}
              locale={es}
              dateFormat="dd/MM/yyyy"
              placeholderText="Fecha final"
              className="w-full h-9 px-2 bg-bg border border-border rounded-lg text-text text-xs focus:outline-none focus:border-accent transition-colors cursor-pointer"
              wrapperClassName="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Litros</p>
          <p className="text-xl font-bold font-display text-text">{totalLitros.toFixed(1)} L</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Total Consumido</p>
          <p className="text-xl font-bold font-display text-accent">{formatCurrency(totalImporte)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-muted">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          {dateDesde && dateHasta && (
            <span className="hidden sm:inline">
              {' '}· {format(dateDesde, "d MMM'.'", { locale: es })} al {format(dateHasta, "d MMM'.' yyyy", { locale: es })}
            </span>
          )}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-24 h-24 text-surface-2 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 2C9 7 6 11 6 14a6 6 0 1012 0c0-3-3-7-6-12z" />
          </svg>
          <p className="text-text-muted font-medium">No hay registros en este período</p>
          <p className="text-sm text-text-muted mt-1">Seleccioná otro rango de fechas</p>
          <a
            href="/nuevo-registro"
            className="inline-flex items-center gap-2 mt-4 px-6 h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-colors touch-target"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Registro
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReportCard key={r.id} registro={r} />
          ))}
        </div>
      )}

      <a
        href="/nuevo-registro"
        className="fixed bottom-20 right-4 z-30 w-14 h-14 bg-accent hover:bg-accent/90 text-white rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-target"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </a>
    </div>
  );
}
