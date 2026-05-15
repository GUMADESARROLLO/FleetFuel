import type { RegistroCombustible } from '../lib/types';

interface Props {
  registro: RegistroCombustible | null;
  onClose: () => void;
}

export default function PendingAlert({ registro, onClose }: Props) {
  if (!registro) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl border border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/15 mb-4 mx-auto">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-lg text-text text-center mb-2">
          Pendiente de sincronización
        </h3>
        <p className="text-sm text-text-muted text-center leading-relaxed mb-6">
          Este registro se guardó en modo offline y estará disponible para consultar una vez que se sincronice automáticamente con el servidor.
        </p>
        <button
          onClick={onClose}
          className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-colors text-sm"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
