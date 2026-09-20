// Mic glyph: capsule + arc + stem + base, 2.6 black stroke, inside a 36×36 frame (matches Figma "Frame" 36×36).
export function MicIcon({ size = 36, color = '#000', stroke = 2.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <rect x="12" y="3" width="12" height="21" rx="6" />
      <path d="M7 17.5a11 11 0 0 0 22 0" />
      <path d="M18 28.5V33" />
      <path d="M13 33h10" />
    </svg>
  );
}

export function PlusIcon({ size = 24, color = '#000', stroke = 2.4 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ChevronLeft({ size = 28, color = '#fff', stroke = 2.4 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 5.5 9 14l8.5 8.5" />
    </svg>
  );
}

export function ArrowRight({ size = 26, color = '#fff', stroke = 2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 13h17M15 6.5l6.5 6.5-6.5 6.5" />
    </svg>
  );
}

// TikTok note glyph (used beside "Thinking...").
export function TikTokGlyph({ size = 14, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}
