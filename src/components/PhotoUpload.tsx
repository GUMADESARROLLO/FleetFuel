import { useRef, useState } from 'react';

interface PhotoUploadProps {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  shape?: 'circle' | 'rect';
  required?: boolean;
}

export default function PhotoUpload({ label, value, onChange, shape = 'circle', required }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Solo imágenes');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Máximo 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div class="flex flex-col items-center gap-2">
      <p class="text-sm font-medium text-text-muted text-center">
        {label}
        {required && <span class="text-danger ml-0.5">*</span>}
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        class={`relative w-24 h-24 ${
          shape === 'circle' ? 'rounded-full' : 'rounded-xl'
        } border-2 border-dashed transition-all duration-200 overflow-hidden ${
          value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 bg-surface'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt={label} class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="absolute top-1 right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={3}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </>
        ) : (
          <div class="flex flex-col items-center justify-center h-full gap-1">
            <svg class="w-7 h-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-[10px] text-text-muted text-center px-1 leading-tight">Toca para foto</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p class="text-xs text-danger animate-fade-in">{error}</p>}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          class="text-xs text-danger/80 hover:text-danger transition-colors"
        >
          Eliminar foto
        </button>
      )}
    </div>
  );
}
