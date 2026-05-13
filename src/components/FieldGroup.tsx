import { type FieldError } from 'react';

interface FieldGroupProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FieldGroup({ label, required, error, children, className = '' }: FieldGroupProps) {
  return (
    <div class={`flex flex-col gap-1.5 ${className}`}>
      <label class="text-sm font-medium text-text-muted">
        {label}
        {required && <span class="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p class="text-xs text-danger mt-0.5 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
