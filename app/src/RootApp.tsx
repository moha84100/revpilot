import { lazy, Suspense, useEffect } from 'react'
import { resolveExperience } from './lib/routes'

const DashboardApp = lazy(() => import('./App'))
const MarketingHome = lazy(() => import('./marketing/MarketingHome'))

const marketingDescription = 'RevPilot aide les hôtels indépendants à repérer plus tôt les dates à optimiser grâce à des recommandations tarifaires claires et expliquées.'

export default function RootApp() {
  const experience = resolveExperience(window.location.pathname)

  useEffect(() => {
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (experience === 'dashboard') {
      document.title = 'RevPilot — Pilotage hôtelier'
      robots?.setAttribute('content', 'noindex, nofollow')
    } else {
      document.title = 'Logiciel revenue management hôtel | RevPilot'
      description?.setAttribute('content', marketingDescription)
      robots?.setAttribute('content', 'index, follow, max-image-preview:large')
    }
  }, [experience])

  return <Suspense fallback={<div style={{ minHeight: '100vh', background: '#f4f0e7' }} aria-label="Chargement de RevPilot" />}>
    {experience === 'dashboard' ? <DashboardApp /> : <MarketingHome />}
  </Suspense>
}
