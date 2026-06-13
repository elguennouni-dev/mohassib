/**
 * Lightweight loading placeholder for paged list views.
 * Renders N rows of pulse-animated grey bars so the table doesn't
 * collapse to a tiny spinner while data is in flight.
 */
export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="table-skeleton" aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="table-skeleton-row">
          {Array.from({ length: columns }, (_, c) => (
            <span
              key={c}
              className="skeleton table-skeleton-cell"
              style={{
                width: c === columns - 1 ? '40%' : c === 0 ? '70%' : '85%',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
