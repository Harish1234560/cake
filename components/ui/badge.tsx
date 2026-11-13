import { cn } from '@/lib/utils';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill border px-3 py-1 text-[10px] uppercase tracking-widest font-medium',
        className
      )}
      style={{
        borderColor: 'var(--border-strong)',
        background: 'rgba(20,13,9,0.6)',
        backdropFilter: 'blur(8px)',
        color: 'var(--accent-bright)',
        animation: 'shimmer 4s linear infinite',
      }}
    >
      {children}
    </span>
  );
}
