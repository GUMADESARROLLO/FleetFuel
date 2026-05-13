import type { RegistroCombustible } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/storage';

interface ReportCardProps {
  registro: RegistroCombustible;
}

export default function ReportCard({ registro }: ReportCardProps) {
  return (
    <a
      href={`/reportes/${registro.id}`}
      class="block bg-surface rounded-xl border border-border p-4 hover:border-accent/30 transition-colors active:scale-[0.99]"
    >
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-accent/15 text-accent text-[10px] font-bold rounded-md uppercase tracking-wider">
            {registro.vehiculoNombre?.split(' ').slice(0, 2).join(' ') || 'Vehículo'}
          </span>
          <span class="text-[10px] text-text-muted">{registro.vehiculoPlaca}</span>
        </div>
        <svg class="w-4 h-4 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div class="flex items-center gap-3 mb-3">
        <p class="text-xs text-text-muted">{formatDate(registro.fechaCreacion)}</p>
        <span class="w-1 h-1 rounded-full bg-text-muted" />
        <p class="text-xs text-text-muted">{registro.proveedor}</p>
      </div>

      <div class="flex items-end justify-between">
        <div class="flex gap-4">
          <div>
            <p class="text-[10px] text-text-muted uppercase">Litros</p>
            <p class="text-sm font-bold text-text">{registro.litros?.toFixed(2) || '0.00'} L</p>
          </div>
          <div>
            <p class="text-[10px] text-text-muted uppercase">Total</p>
            <p class="text-sm font-bold text-accent">{formatCurrency(registro.importeTotal || 0)}</p>
          </div>
        </div>
        <div class="flex -space-x-2">
          {registro.fotoOdometroAntes && (
            <img src={registro.fotoOdometroAntes} alt="" class="w-8 h-8 rounded-full border-2 border-surface object-cover" />
          )}
          {registro.fotoOdometroDespues && (
            <img src={registro.fotoOdometroDespues} alt="" class="w-8 h-8 rounded-full border-2 border-surface object-cover" />
          )}
          {registro.fotoFactura && (
            <div class="w-8 h-8 rounded border-2 border-surface bg-surface-2 flex items-center justify-center">
              <svg class="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
          {registro.fotoVoucher && (
            <div class="w-8 h-8 rounded border-2 border-surface bg-surface-2 flex items-center justify-center">
              <svg class="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
