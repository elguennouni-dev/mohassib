import type { CSSProperties, ReactNode } from 'react'

type SpaceToken = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16
type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
type Justify = 'start' | 'center' | 'end' | 'between' | 'around'

const ALIGN_MAP: Record<Align, CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}

const JUSTIFY_MAP: Record<Justify, CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
}

type StackProps = {
  gap?: SpaceToken
  align?: Align
  justify?: Justify
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/** Vertical layout primitive. `gap` maps to --space-N tokens. */
export function Stack({ gap = 4, align, justify, className, style, children }: StackProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `var(--space-${gap})`,
        alignItems: align ? ALIGN_MAP[align] : undefined,
        justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

type ClusterProps = StackProps & {
  wrap?: boolean
}

/** Horizontal layout primitive (with optional wrap). */
export function Cluster({
  gap = 3,
  align = 'center',
  justify,
  wrap = true,
  className,
  style,
  children,
}: ClusterProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: `var(--space-${gap})`,
        alignItems: ALIGN_MAP[align],
        justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
