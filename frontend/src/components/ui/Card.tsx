import type { CSSProperties, ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  padded?: boolean
  className?: string
  style?: CSSProperties
}

export function Card({ children, padded = true, className = '', style }: CardProps) {
  const classes = ['card', padded && 'card-padded', className].filter(Boolean).join(' ')
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  )
}
