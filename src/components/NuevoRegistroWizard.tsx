import { useEffect, useState } from 'react';
import { getSession, requireAuth } from '../lib/auth';
import {
  VEHICULOS,
  TIPOS_COMBUSTIBLE,
  PROVEEDORES,
  SUB_PROYECTOS,
} from '../lib/constants';
import { saveRegistro, saveDraft, getDraft, clearDraft, generateId, markPendingSync } from '../lib/storage';
import type { DraftRegistro, RegistroCombustible } from '../lib/types';
import StepProgress from './StepProgress';
import PhotoUpload from './PhotoUpload';
import FieldGroup from './FieldGroup';
import Toast from './Toast';

const STEP_LABELS = ['Evidencia', 'Vehículo', 'Factura', 'Ruta'];

const emptyDraft: DraftRegistro = {
  fotoOdometroAntes: '',
  fotoOdometroDespues: '',
  fotoFactura: '',
  fotoVoucher: '',
  vehiculoId: '',
  tipoCombustible: '',
  proveedor: '',
  subProyecto: '',
  kilometraje: '',
  fechaFactura: '',
  numeroFactura: '',
  numeroVoucher: '',
  gravadas: '',
  isr: '',
  excedentes: '',
  litros: '',
  importeTotal: '',
  rutaRecorrida: '',
};

export default function NuevoRegistroWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DraftRegistro>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    requireAuth();
    const draft = getDraft();
    if (draft) setForm({ ...emptyDraft, ...draft });
  }, []);

  useEffect(() => {
    saveDraft(form);
  }, [form]);

  const updateField = (field: keyof DraftRegistro, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!form.fotoOdometroAntes) errs.fotoOdometroAntes = 'Requerido';
      if (!form.fotoOdometroDespues) errs.fotoOdometroDespues = 'Requerido';
    } else if (s === 2) {
      if (!form.vehiculoId) errs.vehiculoId = 'Selecciona un vehículo';
      if (!form.tipoCombustible) errs.tipoCombustible = 'Selecciona un tipo';
      if (!form.proveedor) errs.proveedor = 'Selecciona un proveedor';
      if (!form.subProyecto) errs.subProyecto = 'Selecciona un proyecto';
      if (!form.kilometraje) errs.kilometraje = 'Ingresa el kilometraje';
      if (!form.fechaFactura) errs.fechaFactura = 'Selecciona la fecha';
    } else if (s === 3) {
      if (!form.numeroFactura) errs.numeroFactura = 'Requerido';
      if (!form.numeroVoucher) errs.numeroVoucher = 'Requerido';
      if (!form.litros) errs.litros = 'Ingresa los litros';
      if (!form.importeTotal) errs.importeTotal = 'Ingresa el importe';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const montosCuadran = (): boolean => {
    if (!form.gravadas || !form.isr || !form.excedentes || !form.importeTotal) return false;
    const suma = parseFloat(form.gravadas || '0') + parseFloat(form.isr || '0') + parseFloat(form.excedentes || '0');
    const total = parseFloat(form.importeTotal || '0');
    return Math.abs(suma - total) < 0.01;
  };

  const handleSave = () => {
    if (!validateStep(3)) {
      setStep(3);
      return;
    }

    const session = getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }

    const vehiculo = VEHICULOS.find((v) => v.id === form.vehiculoId);

    const registro: RegistroCombustible = {
      id: generateId(),
      userId: session.username,
      fechaCreacion: new Date().toISOString(),
      fotoOdometroAntes: form.fotoOdometroAntes,
      fotoOdometroDespues: form.fotoOdometroDespues,
      fotoFactura: form.fotoFactura,
      fotoVoucher: form.fotoVoucher,
      vehiculoId: form.vehiculoId,
      vehiculoNombre: vehiculo?.nombre || '',
      vehiculoPlaca: vehiculo?.placa || '',
      tipoCombustible: form.tipoCombustible,
      proveedor: form.proveedor,
      subProyecto: form.subProyecto,
      kilometraje: parseInt(form.kilometraje) || 0,
      fechaFactura: form.fechaFactura,
      numeroFactura: form.numeroFactura,
      numeroVoucher: form.numeroVoucher,
      gravadas: parseFloat(form.gravadas || '0'),
      isr: parseFloat(form.isr || '0'),
      excedentes: parseFloat(form.excedentes || '0'),
      litros: parseFloat(form.litros || '0'),
      importeTotal: parseFloat(form.importeTotal || '0'),
      rutaRecorrida: form.rutaRecorrida,
      sincronizado: navigator.onLine,
    };

    saveRegistro(session.username, registro);

    if (!navigator.onLine) {
      markPendingSync(registro.id);
      setToast({ visible: true, message: 'Guardado localmente, se sincronizará al recuperar conexión', type: 'offline' });
    } else {
      setToast({ visible: true, message: '¡Registro guardado correctamente!', type: 'success' });
    }

    clearDraft();
    setSaved(true);

    setTimeout(() => {
      window.location.href = '/reportes';
    }, 2000);
  };

  if (saved) return null;

  const isStep2Valid = form.vehiculoId && form.tipoCombustible && form.proveedor && form.subProyecto && form.kilometraje && form.fechaFactura;
  const isStep1Valid = form.fotoOdometroAntes && form.fotoOdometroDespues;

  return (
    <div class="px-4 py-4 max-w-lg mx-auto">
      <StepProgress currentStep={step} totalSteps={4} labels={STEP_LABELS} />

      {step === 1 && (
        <div class="animate-fade-in">
          <h2 class="text-lg font-bold font-display text-text mb-4">Evidencia Fotográfica</h2>
          <p class="text-sm text-text-muted mb-6">Toma o selecciona fotos de cada evidencia requerida</p>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <PhotoUpload
              label="Odómetro ANTES"
              value={form.fotoOdometroAntes}
              onChange={(v) => updateField('fotoOdometroAntes', v)}
              shape="circle"
              required
            />
            <PhotoUpload
              label="Odómetro DESPUÉS"
              value={form.fotoOdometroDespues}
              onChange={(v) => updateField('fotoOdometroDespues', v)}
              shape="circle"
              required
            />
            <PhotoUpload
              label="Factura / Vale"
              value={form.fotoFactura}
              onChange={(v) => updateField('fotoFactura', v)}
              shape="rect"
            />
            <PhotoUpload
              label="Voucher / Placa"
              value={form.fotoVoucher}
              onChange={(v) => updateField('fotoVoucher', v)}
              shape="rect"
            />
          </div>
          {errors.fotoOdometroAntes && (
            <p class="text-sm text-danger mb-4 animate-fade-in">Los odómetros antes y después son obligatorios</p>
          )}
          <button
            onClick={nextStep}
            disabled={!isStep1Valid}
            class="w-full h-12 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all touch-target"
          >
            Siguiente
          </button>
        </div>
      )}

      {step === 2 && (
        <div class="animate-fade-in">
          <h2 class="text-lg font-bold font-display text-text mb-4">Datos del Vehículo</h2>
          <div class="space-y-4">
            <FieldGroup label="Vehículo" required error={errors.vehiculoId}>
              <select
                value={form.vehiculoId}
                onChange={(e) => updateField('vehiculoId', e.target.value)}
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="">Seleccione Vehículo</option>
                {VEHICULOS.map((v) => (
                  <option key={v.id} value={v.id}>{v.nombre} ({v.placa})</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Tipo de Combustible" required error={errors.tipoCombustible}>
              <select
                value={form.tipoCombustible}
                onChange={(e) => updateField('tipoCombustible', e.target.value)}
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="">Seleccione Tipo</option>
                {TIPOS_COMBUSTIBLE.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Proveedor" required error={errors.proveedor}>
              <select
                value={form.proveedor}
                onChange={(e) => updateField('proveedor', e.target.value)}
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="">Seleccione Proveedor</option>
                {PROVEEDORES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Sub Proyecto" required error={errors.subProyecto}>
              <select
                value={form.subProyecto}
                onChange={(e) => updateField('subProyecto', e.target.value)}
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-accent transition-colors appearance-none"
              >
                <option value="">Seleccione Sub Proyecto</option>
                {SUB_PROYECTOS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Kilometraje Odómetro" required error={errors.kilometraje}>
              <input
                type="number"
                value={form.kilometraje}
                onChange={(e) => updateField('kilometraje', e.target.value)}
                placeholder="Ej: 45230 km"
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </FieldGroup>

            <FieldGroup label="Fecha de Factura" required error={errors.fechaFactura}>
              <input
                type="date"
                value={form.fechaFactura}
                onChange={(e) => updateField('fechaFactura', e.target.value)}
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text focus:outline-none focus:border-accent transition-colors"
              />
            </FieldGroup>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              onClick={prevStep}
              class="flex-1 h-12 bg-surface-2 hover:bg-surface-2/80 text-text font-medium rounded-xl transition-colors touch-target"
            >
              Atrás
            </button>
            <button
              onClick={nextStep}
              disabled={!isStep2Valid}
              class="flex-1 h-12 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all touch-target"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div class="animate-fade-in">
          <h2 class="text-lg font-bold font-display text-text mb-4">Datos de Factura</h2>

          <div class="bg-surface rounded-xl border-l-4 border-accent p-4 mb-4 space-y-4">
            <FieldGroup label="Número de Factura" required error={errors.numeroFactura}>
              <input
                type="text"
                value={form.numeroFactura}
                onChange={(e) => updateField('numeroFactura', e.target.value)}
                placeholder="Ej: F001-00123"
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </FieldGroup>

            <FieldGroup label="No. Voucher de Pago" required error={errors.numeroVoucher}>
              <input
                type="text"
                value={form.numeroVoucher}
                onChange={(e) => updateField('numeroVoucher', e.target.value)}
                placeholder="Ej: VCH-2024-0089"
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </FieldGroup>
          </div>

          <div class="bg-surface rounded-xl border-l-4 border-accent p-4 mb-4 space-y-4">
            <h3 class="text-sm font-bold text-text mb-2">Montos</h3>
            <FieldGroup label="Gravadas">
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={form.gravadas}
                onChange={(e) => updateField('gravadas', e.target.value)}
                placeholder="0.00"
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </FieldGroup>

            <FieldGroup label="Impuesto sobre la Renta">
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={form.isr}
                onChange={(e) => updateField('isr', e.target.value)}
                placeholder="0.00"
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </FieldGroup>

            <FieldGroup label="Excedentes">
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={form.excedentes}
                onChange={(e) => updateField('excedentes', e.target.value)}
                placeholder="0.00"
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </FieldGroup>

            <FieldGroup label="Litros / Libras" required error={errors.litros}>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={form.litros}
                onChange={(e) => updateField('litros', e.target.value)}
                placeholder="0.00"
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </FieldGroup>

            <FieldGroup label="Importe Total" required error={errors.importeTotal}>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={form.importeTotal}
                onChange={(e) => updateField('importeTotal', e.target.value)}
                placeholder="0.00"
                class="w-full h-12 px-4 bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </FieldGroup>

            {montosCuadran() && (
              <div class="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-xl">
                <svg class="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2.5}>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm font-medium text-success">Montos cuadrados</span>
              </div>
            )}
          </div>

          <div class="flex gap-3 mt-6">
            <button
              onClick={prevStep}
              class="flex-1 h-12 bg-surface-2 hover:bg-surface-2/80 text-text font-medium rounded-xl transition-colors touch-target"
            >
              Atrás
            </button>
            <button
              onClick={nextStep}
              class="flex-1 h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all touch-target"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div class="animate-fade-in">
          <h2 class="text-lg font-bold font-display text-text mb-4">Ruta y Confirmación</h2>

          <FieldGroup label="Ruta recorrida">
            <textarea
              value={form.rutaRecorrida}
              onChange={(e) => updateField('rutaRecorrida', e.target.value)}
              placeholder="Origen → Destino, paradas intermedias..."
              rows={4}
              maxLength={500}
              class="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-text placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <p class="text-xs text-text-muted text-right mt-1">{form.rutaRecorrida.length}/500</p>
          </FieldGroup>

          <details class="mt-6 bg-surface rounded-xl border border-border overflow-hidden">
            <summary class="px-4 py-3 text-sm font-bold text-text cursor-pointer hover:bg-surface-2 transition-colors touch-target">
              Ver resumen del registro
            </summary>
            <div class="px-4 pb-4 space-y-3 text-sm">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="text-[10px] text-text-muted uppercase">Vehículo</p>
                  <p class="text-text font-medium">{VEHICULOS.find(v => v.id === form.vehiculoId)?.nombre || '-'}</p>
                </div>
                <div>
                  <p class="text-[10px] text-text-muted uppercase">Combustible</p>
                  <p class="text-text font-medium">{form.tipoCombustible}</p>
                </div>
                <div>
                  <p class="text-[10px] text-text-muted uppercase">Proveedor</p>
                  <p class="text-text font-medium">{form.proveedor}</p>
                </div>
                <div>
                  <p class="text-[10px] text-text-muted uppercase">Kilometraje</p>
                  <p class="text-text font-medium">{form.kilometraje} km</p>
                </div>
                <div>
                  <p class="text-[10px] text-text-muted uppercase">Litros</p>
                  <p class="text-text font-medium">{form.litros} L</p>
                </div>
                <div>
                  <p class="text-[10px] text-text-muted uppercase">Importe</p>
                  <p class="text-accent font-bold">${parseFloat(form.importeTotal || '0').toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p class="text-[10px] text-text-muted uppercase">Factura</p>
                <p class="text-text font-medium">{form.numeroFactura}</p>
              </div>
              <div>
                <p class="text-[10px] text-text-muted uppercase">Voucher</p>
                <p class="text-text font-medium">{form.numeroVoucher}</p>
              </div>
            </div>
          </details>

          <div class="flex flex-col gap-3 mt-6">
            <button
              onClick={handleSave}
              class="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-colors touch-target flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2.5}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Guardar Registro
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              class="w-full h-12 border border-border hover:bg-surface text-text-muted font-medium rounded-xl transition-colors touch-target"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
        duration={4000}
      />
    </div>
  );
}
