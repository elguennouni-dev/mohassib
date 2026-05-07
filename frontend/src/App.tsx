import { AppRouter } from './router/AppRouter'
import { OfflineBanner } from './components/feedback/OfflineBanner'

function App() {
  return (
    <>
      <OfflineBanner />
      <AppRouter />
    </>
  )
}

export default App
