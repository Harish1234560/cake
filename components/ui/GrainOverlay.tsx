'use client';

export function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200] bg-grain opacity-[0.05] mix-blend-overlay"
      aria-hidden="true"
    />
  );
}
