import type { ReactNode } from 'react'

type SectionProps = {
  title?: string
  description?: string
  actions?: ReactNode
  flush?: boolean
  children: ReactNode
}

/** Visually grouped block with an optional header (title + description + actions). */
export function Section({ title, description, actions, flush = false, children }: SectionProps) {
  return (
    <section className="section">
      {(title || actions) && (
        <header className="section-header">
          <div>
            {title && <h2 className="section-title">{title}</h2>}
            {description && <p className="section-description">{description}</p>}
          </div>
          {actions && <div className="section-actions">{actions}</div>}
        </header>
      )}
      <div className={flush ? 'section-body section-body-flush' : 'section-body'}>{children}</div>
    </section>
  )
}
