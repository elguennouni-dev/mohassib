import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null
  return (
    <div className="offline-banner" role="status" aria-live="polite">
      <WifiOff size={16} aria-hidden="true" />
      <span>Vous êtes hors ligne — certaines fonctionnalités peuvent être indisponibles.</span>
    </div>
  )
}
