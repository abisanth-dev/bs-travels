/**
 * Quiet line-art motifs for the service panels: passport, boarding pass,
 * luggage tag and translated document. Pure SVG, no extra WebGL.
 */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PassportMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden>
      <g {...stroke}>
        <rect x="58" y="22" width="112" height="156" rx="8" />
        <rect x="64" y="28" width="100" height="144" rx="5" strokeOpacity=".4" />
        <circle cx="114" cy="86" r="26" />
        <ellipse cx="114" cy="86" rx="11" ry="26" />
        <path d="M88 86h52M93 72h42M93 100h42" />
        <path d="M86 140h56M94 152h40" strokeOpacity=".6" />
      </g>
      <g {...stroke} stroke="var(--color-gold)" transform="rotate(-14 178 140)">
        <rect x="140" y="112" width="78" height="52" rx="6" strokeDasharray="3 3" />
        <path d="M150 128h40M150 140h56M150 152h30" />
        <circle cx="203" cy="129" r="7" />
      </g>
    </svg>
  );
}

export function BoardingPassMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 170" className={className} aria-hidden>
      <g {...stroke}>
        <path d="M14 30a10 10 0 0 1 10-10h272a10 10 0 0 1 10 10v40a14 14 0 0 0 0 28v42a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V98a14 14 0 0 0 0-28z" />
        <path d="M232 22v126" strokeDasharray="3 4" strokeOpacity=".6" />
      </g>
      <g fill="currentColor" fontFamily="var(--font-sans)">
        <text x="34" y="52" fontSize="10" letterSpacing="2" opacity=".6">FROM</text>
        <text x="34" y="82" fontSize="26" fontFamily="var(--font-display)">Jaffna</text>
        <text x="146" y="52" fontSize="10" letterSpacing="2" opacity=".6">TO</text>
        <text x="146" y="82" fontSize="26" fontFamily="var(--font-display)" fill="var(--color-gold)">
          Anywhere
        </text>
        <text x="34" y="118" fontSize="9" letterSpacing="2" opacity=".55">PASSENGER</text>
        <text x="34" y="134" fontSize="12" opacity=".85">You</text>
        <text x="146" y="118" fontSize="9" letterSpacing="2" opacity=".55">NEXT CHAPTER</text>
        <text x="146" y="134" fontSize="12" opacity=".85">Begins here</text>
      </g>
      <g {...stroke}>
        <path d="M102 74c8-12 22-12 30 0" stroke="var(--color-gold)" strokeDasharray="2 3" />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M${248 + i * 3.6} 52v${i % 3 === 0 ? 70 : 58}`} strokeOpacity=".7" />
        ))}
      </g>
    </svg>
  );
}

export function LuggageMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden>
      <g {...stroke}>
        <rect x="70" y="56" width="96" height="120" rx="10" />
        <path d="M98 56V36h40v20M94 82v74M118 82v74M142 82v74M84 176v10M152 176v10" />
      </g>
      <g {...stroke} stroke="var(--color-gold)">
        <path d="M150 64c18 4 30 14 34 30" />
        <path d="M176 96l26-8 12 40-26 8z" />
        <circle cx="186" cy="102" r="3" />
        <path d="M188 116l14-4M192 126l10-3" />
      </g>
    </svg>
  );
}

export function DocumentMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden>
      <g {...stroke}>
        <path d="M40 30h70l20 20v120H40z" />
        <path d="M110 30v20h20" />
        <path d="M54 76h56M54 92h62M54 108h48M54 124h58" strokeOpacity=".7" />
      </g>
      <g {...stroke} stroke="var(--color-gold)">
        <path d="M120 52h70l20 20v110h-90z" />
        <path d="M134 98h56M134 114h62M134 130h44M134 146h52" />
        <circle cx="186" cy="162" r="11" strokeDasharray="2 2" />
      </g>
      <g fill="currentColor" fontFamily="var(--font-sans)" fontSize="11">
        <text x="54" y="62" opacity=".75">தமிழ் · සිංහල</text>
        <text x="134" y="84" fill="var(--color-gold)">English</text>
      </g>
    </svg>
  );
}
