import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  external?: boolean
  className?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
}

export default function Button({ children, href, onClick, variant = 'primary', external, className = '', type = 'button', ariaLabel }: Props) {
  const base = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-base font-bold transition-colors'
  const styles = variant === 'primary'
    ? 'bg-white text-[#1c3fd6] shadow-[0_10px_30px_-10px_rgba(0,20,120,0.7)] hover:bg-[#e3f4ff]'
    : 'border-2 border-white/40 bg-white/5 text-white hover:border-white hover:bg-white/10'
  const cls = `${base} ${styles} ${className}`
  const motionProps = { whileHover: { y: -2 }, whileTap: { scale: 0.97 }, transition: { duration: 0.2 } }
  if (href) {
    return (
      <motion.a href={href} className={cls} aria-label={ariaLabel} {...motionProps}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </motion.a>
    )
  }
  return <motion.button type={type} onClick={onClick} className={cls} aria-label={ariaLabel} {...motionProps}>{children}</motion.button>
}
