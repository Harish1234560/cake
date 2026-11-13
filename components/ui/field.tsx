import { cn } from '@/lib/utils';

type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Field({ label, htmlFor, error, required, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs uppercase tracking-caption text-accent"
      >
        {label}
        {required && <span className="text-foreground/40"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
