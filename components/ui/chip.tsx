'use client';

import { cn } from '@/lib/utils';

type ChipProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-pill border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 min-h-[40px] whitespace-nowrap"
      style={active
        ? { borderColor: 'transparent', background: 'var(--gold-gradient)', color: 'var(--bg)', fontWeight: 500 }
        : { borderColor: 'var(--border-strong)', color: 'var(--fg-muted)' }
      }
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-bright)'; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--fg-muted)'; } }}
    >
      {label}
    </button>
  );
}
