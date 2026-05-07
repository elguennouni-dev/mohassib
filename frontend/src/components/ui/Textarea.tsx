import { forwardRef, type TextareaHTMLAttributes } from 'react'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className = '', rows = 4, ...rest },
  ref,
) {
  const classes = ['textarea', invalid && 'textarea-invalid', className].filter(Boolean).join(' ')
  return <textarea ref={ref} className={classes} rows={rows} aria-invalid={invalid || undefined} {...rest} />
})
