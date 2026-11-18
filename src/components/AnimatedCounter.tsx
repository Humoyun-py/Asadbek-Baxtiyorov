import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

interface Props { value: number; prefix?: string; suffix?: string; decimals?: number; duration?: number }

const fmt = (n: number, d: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })

export default function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 2 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? value : 0)

  useEffect(() => {
    if (!inView) return
    if (reduce) { setN(value); return }
    const c = animate(0, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setN })
    return () => c.stop()
  }, [inView, value, duration, reduce])

  return <span ref={ref} aria-label={`${prefix}${fmt(value, decimals)}${suffix}`}>{prefix}{fmt(n, decimals)}{suffix && <span className="ml-1 text-[0.5em] font-bold">{suffix.trim()}</span>}</span>
}
