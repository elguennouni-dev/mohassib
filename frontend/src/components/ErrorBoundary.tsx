import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur applicative non interceptee:', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleHome = () => {
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div
          style={{
            maxWidth: 520,
            padding: 'var(--space-7)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface-2)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ marginBottom: 'var(--space-3)' }}>Une erreur est survenue</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
            Une erreur inattendue a interrompu l'application. Vous pouvez recharger la page ou revenir a l'accueil.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              Recharger la page
            </button>
            <button type="button" className="btn btn-secondary" onClick={this.handleHome}>
              Retour a l'accueil
            </button>
          </div>
        </div>
      </div>
    )
  }
}
