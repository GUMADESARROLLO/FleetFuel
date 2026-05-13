export default function BottomNav() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';

  const links = [
    { href: '/dashboard', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/nuevo-registro', label: 'Nuevo', icon: 'M12 4v16m8-8H4' },
    { href: '/reportes', label: 'Reportes', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  return (
    <nav class="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
      <div class="bg-surface/95 backdrop-blur-lg border-t border-border">
        <div class="flex items-center justify-around h-16 max-w-lg mx-auto">
          {links.map((link) => {
            const isActive = path === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                class={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-lg transition-colors touch-target ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-text'
                }`}
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={isActive ? 2.5 : 1.5}>
                  <path stroke-linecap="round" stroke-linejoin="round" d={link.icon} />
                </svg>
                <span class="text-[10px] font-semibold uppercase tracking-wider">{link.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
