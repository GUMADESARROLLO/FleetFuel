import { useRef, useState } from 'react';

interface PhotoUploadProps {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  shape?: 'circle' | 'rect';
  required?: boolean;
}

export default function PhotoUpload({ label, value, onChange, shape = 'rect', required }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const compressImage = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = src;
    });
  };

  const handleFile = async (file: File) => {
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
    reader.onloadend = async () => {
      try {
        const compressed = await compressImage(reader.result as string);
        onChange(compressed);
      } catch {
        setError('Error al procesar imagen');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium text-text-muted">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative w-full h-40 ${
          shape === 'circle' ? 'rounded-full' : 'rounded-xl'
        } border-2 border-dashed transition-all duration-200 overflow-hidden ${
          value ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 bg-surface'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="absolute top-1 right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-text-muted text-center px-2 leading-tight">Toca para tomar foto</span>
          </div>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="text-xs text-danger animate-fade-in">{error}</p>}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-danger/80 hover:text-danger transition-colors"
        >
          Eliminar foto
        </button>
      )}
    </div>
  );
}
