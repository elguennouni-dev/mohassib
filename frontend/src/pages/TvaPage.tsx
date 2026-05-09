import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  deleteDeclaration,
  downloadDeclarationPdf,
  formatTvaPeriod,
  generateDeclaration,
  listDeclarations,
  previewTVA,
  TVA_STATUS_LABELS,
  type TVADeclaration,
  type TVADeclarationStatus,
  type TVAPreview,
} from '../api/tva'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

const MONTH_OPTIONS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
].map((label, i) => ({ value: i + 1, label }))

const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 4 + i)

export function TvaPage() {
  const [previewMonth, setPreviewMonth] = useState<number>(CURRENT_MONTH)
  const [previewYear, setPreviewYear] = useState<number>(CURRENT_YEAR)
  const [preview, setPreview] = useState<TVAPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const [declarations, setDeclarations] = useState<TVADeclaration[]>([])
  const [historyYear, setHistoryYear] = useState<number | ''>(CURRENT_YEAR)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const [generating, setGenerating] = useState(false)

  const loadPreview = async () => {
    setPreviewLoading(true)
    setPreviewError(null)
    try {
      const result = await previewTVA(previewMonth, previewYear)
      setPreview(result)
    } catch {
      setPreviewError('Impossible de calculer l\'aperçu TVA.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const result = await listDeclarations(historyYear === '' ? undefined : historyYear)
      setDeclarations(result)
    } catch {
      setHistoryError('Impossible de charger l\'historique des déclarations.')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    void loadPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewMonth, previewYear])

  useEffect(() => {
    void loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyYear])

  const handleGenerate = async () => {
    if (!preview) return
    const periodLabel = formatTvaPeriod(previewMonth, previewYear)
    const action = preview.declarationExists ? 'Régénérer' : 'Générer'
    const confirmed = window.confirm(`${action} la déclaration TVA pour ${periodLabel} ?`)
    if (!confirmed) return

    setGenerating(true)
    try {
      await generateDeclaration(previewMonth, previewYear)
      window.alert('Déclaration générée avec succès.')
      void loadPreview()
      void loadHistory()
    } catch (err: unknown) {
      window.alert(extractErrorMessage(err, 'Impossible de générer la déclaration.'))
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (declaration: TVADeclaration) => {
    const confirmed = window.confirm(
      `Supprimer la déclaration TVA de ${formatTvaPeriod(declaration.month, declaration.year)} ?`,
    )
    if (!confirmed) return
    try {
      await deleteDeclaration(declaration.id)
      void loadHistory()
      void loadPreview()
    } catch (err: unknown) {
      window.alert(extractErrorMessage(err, 'Impossible de supprimer la déclaration.'))
    }
  }

  const handleDownload = async (declaration: TVADeclaration) => {
    const label = `declaration-tva-${declaration.year}-${String(declaration.month).padStart(2, '0')}`
    try {
      await downloadDeclarationPdf(declaration.id, label)
    } catch (err: unknown) {
      window.alert(extractErrorMessage(err, 'Impossible de télécharger le PDF.'))
    }
  }

  return (
    <>
      <main className="container" style={{ padding: 'var(--space-8) var(--space-5)' }}>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>TVA</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          Suivez la TVA collectée et déductible. Générez la déclaration mensuelle pour la DGI.
        </p>

        {/* Current month preview */}
        <fieldset
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-6)',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <legend
            style={{
              padding: '0 var(--space-2)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '1.05rem',
            }}
          >
            Aperçu de la période
          </legend>

          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <select
              className="select"
              value={previewMonth}
              onChange={(e) => setPreviewMonth(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={previewYear}
              onChange={(e) => setPreviewYear(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <div style={{ flex: 1 }} />

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating || previewLoading || preview === null}
            >
              {generating
                ? 'Génération...'
                : preview?.declarationExists
                  ? 'Régénérer la déclaration'
                  : 'Générer la déclaration'}
            </button>
          </div>

          {previewError && <div className="alert alert-error">{previewError}</div>}

          {previewLoading && <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>}

          {!previewLoading && preview && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                <KpiCard label="TVA collectée" value={formatMoneyMAD(preview.tvaCollected)} />
                <KpiCard label="TVA déductible" value={formatMoneyMAD(preview.tvaDeductible)} />
                <KpiCard
                  label={Number(preview.tvaToPay) < 0 ? 'Crédit de TVA' : 'TVA à payer'}
                  value={formatMoneyMAD(Math.abs(Number(preview.tvaToPay)))}
                  highlight
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <BreakdownTable
                  title="Ventes par taux"
                  rows={preview.salesByRate}
                  totalLabel="Total ventes"
                  totalBase={preview.salesBase}
                  totalTva={preview.tvaCollected}
                />
                <BreakdownTable
                  title="Dépenses par taux"
                  rows={preview.expensesByRate}
                  totalLabel="Total dépenses"
                  totalBase={preview.expensesBase}
                  totalTva={preview.tvaDeductible}
                />
              </div>

              {preview.declarationExists && (
                <p
                  style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--status-amber-bg)',
                    color: 'var(--status-amber-fg)',
                    border: '1px solid var(--status-amber-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  Une déclaration existe déjà pour cette période. La régénération mettra à jour les montants.
                </p>
              )}
            </>
          )}
        </fieldset>

        {/* History */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            flexWrap: 'wrap',
          }}
        >
          <h2>Historique des déclarations</h2>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Année :
            </label>
            <select
              className="select"
              value={historyYear}
              onChange={(e) => setHistoryYear(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              <option value="">Toutes</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {historyError && <div className="alert alert-error">{historyError}</div>}
        {historyLoading && <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>}

        {!historyLoading && declarations.length === 0 && (
          <div
            style={{
              padding: 'var(--space-6)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            Aucune déclaration enregistrée pour {historyYear === '' ? 'cette plage' : historyYear}.
          </div>
        )}

        {!historyLoading && declarations.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                  <Th>Période</Th>
                  <Th>Statut</Th>
                  <Th align="right">TVA collectée</Th>
                  <Th align="right">TVA déductible</Th>
                  <Th align="right">À payer</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {declarations.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <Td>
                      <span style={{ fontWeight: 600 }}>{formatTvaPeriod(d.month, d.year)}</span>
                    </Td>
                    <Td>
                      <DeclarationStatusBadge status={d.status} />
                    </Td>
                    <Td align="right">{formatMoneyMAD(d.tvaCollected)}</Td>
                    <Td align="right">{formatMoneyMAD(d.tvaDeductible)}</Td>
                    <Td align="right" style={{ fontWeight: 600 }}>
                      {Number(d.tvaToPay) < 0 ? (
                        <span style={{ color: 'var(--color-success)' }}>
                          Crédit {formatMoneyMAD(Math.abs(Number(d.tvaToPay)))}
                        </span>
                      ) : (
                        formatMoneyMAD(d.tvaToPay)
                      )}
                    </Td>
                    <Td align="right">
                      <button
                        type="button"
                        onClick={() => handleDownload(d)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-primary)',
                          cursor: 'pointer',
                          padding: 0,
                          font: 'inherit',
                          textDecoration: 'underline',
                          marginRight: 'var(--space-3)',
                        }}
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(d)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-danger)',
                          cursor: 'pointer',
                          padding: 0,
                          font: 'inherit',
                        }}
                      >
                        Supprimer
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}

function BreakdownTable({
  title,
  rows,
  totalLabel,
  totalBase,
  totalTva,
}: {
  title: string
  rows: Array<{ tvaRate: string; baseAmount: string; tvaAmount: string; entryCount: number }>
  totalLabel: string
  totalBase: string
  totalTva: string
}) {
  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 600,
          backgroundColor: 'var(--color-surface-2)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {title}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left' }}>
            <th style={subThStyle}>Taux</th>
            <th style={{ ...subThStyle, textAlign: 'right' }}>HT</th>
            <th style={{ ...subThStyle, textAlign: 'right' }}>TVA</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={3}
                style={{
                  padding: 'var(--space-4)',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                Aucune entrée pour cette période.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.tvaRate} style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
              <td style={subTdStyle}>{Number(r.tvaRate)}%</td>
              <td style={{ ...subTdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {formatMoneyMAD(r.baseAmount)}
              </td>
              <td style={{ ...subTdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {formatMoneyMAD(r.tvaAmount)}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
            <td style={{ ...subTdStyle, fontWeight: 600 }}>{totalLabel}</td>
            <td
              style={{
                ...subTdStyle,
                textAlign: 'right',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatMoneyMAD(totalBase)}
            </td>
            <td
              style={{
                ...subTdStyle,
                textAlign: 'right',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatMoneyMAD(totalTva)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: highlight ? 'var(--color-primary-light)' : 'var(--color-surface)',
      }}
    >
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 'var(--space-2)',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: highlight ? 'var(--color-primary)' : 'var(--color-text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
    </div>
  )
}

function DeclarationStatusBadge({ status }: { status: TVADeclarationStatus }) {
  const tone: Record<TVADeclarationStatus, string> = {
    DRAFT: 'status-gray',
    SUBMITTED: 'status-blue',
    PAID: 'status-green',
    CANCELLED: 'status-red-muted',
  }
  return <span className={`status-badge ${tone[status]}`}>{TVA_STATUS_LABELS[status]}</span>
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
    if (!err.response) return 'Le serveur est injoignable. Vérifiez votre connexion.'
  }
  return fallback
}

function formatMoneyMAD(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0,00 MAD'
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return '0,00 MAD'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + ' MAD'
}

const subThStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--font-size-xs)',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const subTdStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--font-size-sm)',
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return (
    <th
      style={{
        padding: 'var(--space-3)',
        fontSize: '0.85rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: 'var(--color-text-muted)',
        textAlign: align ?? 'left',
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align,
  style,
}: {
  children: React.ReactNode
  align?: 'right'
  style?: React.CSSProperties
}) {
  return (
    <td
      style={{
        padding: 'var(--space-3)',
        textAlign: align ?? 'left',
        verticalAlign: 'middle',
        fontVariantNumeric: align === 'right' ? 'tabular-nums' : undefined,
        ...style,
      }}
    >
      {children}
    </td>
  )
}
