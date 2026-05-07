import { forwardRef, type SelectHTMLAttributes } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className = '', children, ...rest },
  ref,
) {
  const classes = ['select', invalid && 'select-invalid', className].filter(Boolean).join(' ')
  return (
    <select ref={ref} className={classes} aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  )
})
