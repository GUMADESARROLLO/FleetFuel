import { useEffect, useState } from 'react';
import { getSession, requireAuth } from '../lib/auth';
import {
  getRegistrosDelMes,
  getUltimosRegistros,
  getTotalLitros,
  getTotalImporte,
  getUltimoVehiculo,
  formatCurrency,
  formatDate,
} from '../lib/storage';
import SummaryCard from './SummaryCard';

export default function DashboardContent() {
  const [session, setSession] = useState(getSession());
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalLitros, setTotalLitros] = useState(0);
  const [totalImporte, setTotalImporte] = useState(0);
  const [ultimoVehiculo, setUltimoVehiculo] = useState('');
  const [ultimosRegistros, setUltimosRegistros] = useState<any[]>([]);

  useEffect(() => {
    requireAuth();
    const sess = getSession();
    if (!sess) return;
    setSession(sess);
    loadData(sess.username);
  }, []);

  const loadData = (userId: string) => {
    const mes = getRegistrosDelMes(userId);
    setTotalRegistros(mes.length);
    setTotalLitros(getTotalLitros(userId));
    setTotalImporte(getTotalImporte(userId));
    setUltimoVehiculo(getUltimoVehiculo(userId));
    setUltimosRegistros(getUltimosRegistros(userId, 5));
  };

  if (!session) return null;

  return (
    <div class="px-4 py-4 max-w-lg mx-auto">
      <div class="mb-6 mt-2">
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-xl font-bold font-display text-text">
            Bienvenido, {session.nombre}
          </h2>
          <span class="text-xl">👋</span>
        </div>
        <p class="text-sm text-text-muted">Resumen del mes</p>
      </div>

      <div class="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-6 md:grid md:grid-cols-2 md:overflow-x-visible">
        <SummaryCard
          title="Registros"
          value={totalRegistros}
          color="accent"
          icon={
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <SummaryCard
          title="Litros"
          value={`${totalLitros.toFixed(1)} L`}
          color="accent-2"
          icon={
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
        />
        <SummaryCard
          title="Importe"
          value={formatCurrency(totalImporte)}
          color="accent"
          icon={
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard
          title="Último Vehículo"
          value={ultimoVehiculo}
          color="success"
          icon={
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      <div>
        <h3 class="text-sm font-bold text-text mb-3 uppercase tracking-wider">Últimos Registros</h3>
        {ultimosRegistros.length === 0 ? (
          <div class="text-center py-12">
            <svg class="w-16 h-16 text-surface-2 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p class="text-sm text-text-muted">Aún no hay registros este mes</p>
          </div>
        ) : (
          <div class="space-y-2">
            {ultimosRegistros.map((r) => (
              <a
                key={r.id}
                href={`/reportes/${r.id}`}
                class="flex items-center gap-3 bg-surface rounded-xl border border-border p-3 hover:border-accent/30 transition-colors active:scale-[0.99]"
              >
                <div class="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-text truncate">{r.vehiculoNombre || 'Vehículo'}</span>
                    <span class="text-[10px] text-text-muted">{formatDate(r.fechaCreacion)}</span>
                  </div>
                  <div class="flex items-center gap-3 mt-0.5">
                    <span class="text-xs text-text-muted">{r.litros?.toFixed(1) || '0'} L</span>
                    <span class="text-xs font-bold text-accent">{formatCurrency(r.importeTotal || 0)}</span>
                  </div>
                </div>
                <svg class="w-4 h-4 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>

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
