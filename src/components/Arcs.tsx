export default function Arcs({ className = '' }: { className?: string }) {
  return (
    <svg className={`glow-arc pointer-events-none absolute ${className}`} viewBox="0 0 800 600" fill="none" preserveAspectRatio="none" aria-hidden>
      <path d="M-40 520 C 160 360, 360 520, 560 300 S 780 80, 860 40" stroke="rgba(120,225,255,0.55)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      <path d="M-40 580 C 200 420, 380 560, 600 360 S 800 160, 860 120" stroke="rgba(255,255,255,0.22)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path d="M-40 460 C 120 300, 340 440, 520 240 S 760 20, 860 -10" stroke="rgba(47,91,255,0.5)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
