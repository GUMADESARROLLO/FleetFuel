import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'offline';
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', visible, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible && !show) return null;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    offline: '📡',
  };

  const colors = {
    success: 'bg-success/20 border-success text-success',
    error: 'bg-danger/20 border-danger text-danger',
    info: 'bg-accent/20 border-accent text-accent',
    offline: 'bg-accent/20 border-accent text-accent',
  };

  return (
    <div
      class={`fixed bottom-24 left-4 right-4 z-50 transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div
        class={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[type]} backdrop-blur-sm`}
      >
        <span class="text-lg font-bold">{icons[type]}</span>
        <p class="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={() => { setShow(false); setTimeout(onClose, 300); }}
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 touch-target"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
