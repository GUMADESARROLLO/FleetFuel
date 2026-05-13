import { useEffect, useState } from 'react';
import { getSession, requireAuth } from '../lib/auth';
import {
  getRegistros,
  getMesesDisponibles,
  getNombreMes,
  getRegistrosPorMes,
} from '../lib/storage';
import type { RegistroCombustible } from '../lib/types';
import ReportCard from './ReportCard';

export default function ReportesList() {
  const [registros, setRegistros] = useState<RegistroCombustible[]>([]);
  const [meses, setMeses] = useState<{ mes: number; anio: number }[]>([]);
  const [mesFiltro, setMesFiltro] = useState<string>('all');

  useEffect(() => {
    requireAuth();
    const session = getSession();
    if (!session) return;

    const all = getRegistros(session.username);
    setRegistros(all);

    const m = getMesesDisponibles(session.username);
    setMeses(m);
    if (m.length > 0) {
      const current = `${new Date().getMonth()}-${new Date().getFullYear()}`;
      setMesFiltro(current);
    }
  }, []);

  const registrosFiltrados = registros.filter((r) => {
    if (mesFiltro === 'all') return true;
    const [mes, anio] = mesFiltro.split('-').map(Number);
    const fecha = new Date(r.fechaCreacion);
    return fecha.getMonth() === mes && fecha.getFullYear() === anio;
  });

  return (
    <div class="px-4 py-4 max-w-lg mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold font-display text-text">Mis Reportes</h2>
        <select
          value={mesFiltro}
          onChange={(e) => setMesFiltro(e.target.value)}
          class="h-10 px-3 bg-surface-2 border border-border rounded-xl text-sm text-text focus:outline-none focus:border-accent transition-colors appearance-none"
        >
          <option value="all">Todos</option>
          {meses.map((m) => {
            const key = `${m.mes}-${m.anio}`;
            return (
              <option key={key} value={key}>
                {getNombreMes(m.mes)} {m.anio}
              </option>
            );
          })}
        </select>
      </div>

      {registrosFiltrados.length === 0 ? (
        <div class="text-center py-16">
          <svg class="w-24 h-24 text-surface-2 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={0.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p class="text-text-muted font-medium">Aún no tienes registros</p>
          <p class="text-sm text-text-muted mt-1">¡Carga tu primer combustible!</p>
          <a
            href="/nuevo-registro"
            class="inline-flex items-center gap-2 mt-4 px-6 h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-colors touch-target"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2.5}>
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Registro
          </a>
        </div>
      ) : (
        <div class="space-y-3">
          {registrosFiltrados.map((r) => (
            <ReportCard key={r.id} registro={r} />
          ))}
        </div>
      )}

      <a
        href="/nuevo-registro"
        class="fixed bottom-20 right-4 z-30 w-14 h-14 bg-accent hover:bg-accent/90 text-white rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-target"
      >
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2.5}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </a>
    </div>
  );
}
