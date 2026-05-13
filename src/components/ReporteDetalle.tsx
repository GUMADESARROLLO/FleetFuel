import { useEffect, useState } from 'react';
import { getSession, requireAuth } from '../lib/auth';
import { getRegistroById, formatCurrency, formatDate } from '../lib/storage';
import type { RegistroCombustible } from '../lib/types';

export default function ReporteDetalle({ id }: { id: string }) {
  const [registro, setRegistro] = useState<RegistroCombustible | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    requireAuth();
    const session = getSession();
    if (!session) return;
    const r = getRegistroById(session.username, id);
    setRegistro(r || null);
  }, [id]);

  if (!registro) {
    return (
      <div class="px-4 py-16 text-center max-w-lg mx-auto">
        <svg class="w-16 h-16 text-surface-2 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-text-muted">Registro no encontrado</p>
        <a href="/reportes" class="inline-block mt-4 text-accent font-medium hover:underline">Volver a Reportes</a>
      </div>
    );
  }

  const photos = [
    { label: 'Odómetro Antes', src: registro.fotoOdometroAntes },
    { label: 'Odómetro Después', src: registro.fotoOdometroDespues },
    { label: 'Factura / Vale', src: registro.fotoFactura },
    { label: 'Voucher / Placa', src: registro.fotoVoucher },
  ].filter((p) => p.src);

  return (
    <div class="px-4 py-4 max-w-lg mx-auto">
      <a
        href="/reportes"
        class="inline-flex items-center gap-1.5 text-sm text-accent font-medium hover:underline mb-4 touch-target"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Reportes
      </a>

      <div class="grid grid-cols-2 gap-2 mb-6">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setLightboxImg(photo.src)}
            class="aspect-square rounded-xl overflow-hidden border border-border bg-surface hover:border-accent/50 transition-colors touch-target"
          >
            <img
              src={photo.src}
              alt={photo.label}
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div class="p-1.5 bg-surface/90">
              <p class="text-[10px] text-text-muted text-center truncate">{photo.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div class="bg-surface rounded-xl border border-border p-4 mb-4">
        <h3 class="text-sm font-bold text-text mb-3 uppercase tracking-wider">Vehículo & Combustible</h3>
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="px-3 py-1 bg-accent/15 text-accent text-xs font-bold rounded-lg">
            {registro.vehiculoNombre} ({registro.vehiculoPlaca})
          </span>
          <span class="px-3 py-1 bg-accent-2/15 text-accent-2 text-xs font-bold rounded-lg">
            {registro.tipoCombustible}
          </span>
          <span class="px-3 py-1 bg-success/15 text-success text-xs font-bold rounded-lg">
            {registro.proveedor}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-[10px] text-text-muted uppercase">Sub Proyecto</p>
            <p class="text-text font-medium">{registro.subProyecto}</p>
          </div>
          <div>
            <p class="text-[10px] text-text-muted uppercase">Kilometraje</p>
            <p class="text-text font-medium">{registro.kilometraje?.toLocaleString()} km</p>
          </div>
          <div>
            <p class="text-[10px] text-text-muted uppercase">Fecha Factura</p>
            <p class="text-text font-medium">{formatDate(registro.fechaFactura)}</p>
          </div>
          <div>
            <p class="text-[10px] text-text-muted uppercase">Creado</p>
            <p class="text-text font-medium">{formatDate(registro.fechaCreacion)}</p>
          </div>
        </div>
      </div>

      <div class="bg-surface rounded-xl border border-border p-4 mb-4">
        <h3 class="text-sm font-bold text-text mb-3 uppercase tracking-wider">Facturación</h3>
        <div class="space-y-2">
          {[
            { label: 'Número de Factura', value: registro.numeroFactura },
            { label: 'No. Voucher', value: registro.numeroVoucher },
            { label: 'Gravadas', value: formatCurrency(registro.gravadas) },
            { label: 'Impuesto sobre la Renta', value: formatCurrency(registro.isr) },
            { label: 'Excedentes', value: formatCurrency(registro.excedentes) },
            { label: 'Litros', value: `${registro.litros?.toFixed(2) || '0.00'} L` },
            { label: 'Importe Total', value: formatCurrency(registro.importeTotal), accent: true },
          ].map((row) => (
            <div
              key={row.label}
              class={`flex justify-between items-center py-1.5 ${row.accent ? '' : 'border-b border-border/50'}`}
            >
              <span class="text-sm text-text-muted">{row.label}</span>
              <span class={`text-sm font-bold ${row.accent ? 'text-accent' : 'text-text'}`}>{row.value}</span>
            </div>
          ))}
        </div>
        {registro.gravadas + registro.isr + registro.excedentes > 0 &&
          Math.abs(registro.gravadas + registro.isr + registro.excedentes - registro.importeTotal) < 0.01 && (
            <div class="mt-3 flex items-center gap-2 p-2 bg-success/10 border border-success/30 rounded-lg">
              <svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2.5}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-xs font-medium text-success">Montos cuadrados</span>
            </div>
          )}
      </div>

      {registro.rutaRecorrida && (
        <div class="bg-surface rounded-xl border border-border p-4 mb-4">
          <h3 class="text-sm font-bold text-text mb-3 uppercase tracking-wider">Ruta</h3>
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-sm text-text leading-relaxed">{registro.rutaRecorrida}</p>
          </div>
        </div>
      )}

      <div class="flex items-center gap-2 mb-6">
        <span class={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          registro.sincronizado
            ? 'bg-success/15 text-success'
            : 'bg-accent/15 text-accent'
        }`}>
          <span class={`w-1.5 h-1.5 rounded-full ${registro.sincronizado ? 'bg-success' : 'bg-accent'}`} />
          {registro.sincronizado ? 'Sincronizado' : 'Pendiente de sincronización'}
        </span>
      </div>

      {lightboxImg && (
        <div
          class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white bg-white/10 rounded-full touch-target"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImg}
            alt="Foto ampliada"
            class="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
