import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div class="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div class="bg-surface border border-border rounded-xl p-4 shadow-2xl">
        <div class="flex items-start gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 15v-7m0 0l-3 3m3-3l3 3m-9 4v3a2 2 0 002 2h8a2 2 0 002-2v-3" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-display font-bold text-base text-text">Instala FleetFuel</h3>
            <p class="text-xs text-text-muted mt-0.5">
              Añade esta app a tu pantalla de inicio para usarla sin conexión.
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            onClick={() => setShowPrompt(false)}
            class="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-2 transition-colors touch-target"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstall}
            class="flex-1 py-2 px-4 rounded-lg text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors touch-target"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
