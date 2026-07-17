'use client';

/** Renders the blurred background for the active gallery image. */
export default function AmbientWash({ washUrl }: { washUrl?: string | null }) {
  if (!washUrl) {
    return <div className="absolute inset-0 bg-bg-sidebar/40" aria-hidden="true" />;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        key={washUrl}
        className="absolute inset-[-30%] bg-center bg-cover transition-[opacity,filter] duration-500 ease-out"
        style={{
          backgroundImage: `url(${washUrl})`,
          filter: 'blur(56px) saturate(1.2)',
          transform: 'scale(1.15)',
          opacity: 0.55,
        }}
      />
      {/* Preserve text contrast without hiding the active-image wash. */}
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-layout)_58%,transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-layout)] via-transparent to-[var(--bg-layout)] opacity-70" />
    </div>
  );
}
