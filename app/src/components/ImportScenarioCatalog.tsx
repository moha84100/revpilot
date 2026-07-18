import { Download, FileSpreadsheet, LoaderCircle, Play } from 'lucide-react'
import { importScenarios, type ImportScenario } from '../data/importScenarios'

export function scenarioHref(scenario: ImportScenario) {
  return `../scenarios/${scenario.filename}`
}

export function ImportScenarioCatalog({ loadingId, activeId, onLoad }: { loadingId: string | null; activeId: string | null; onLoad: (scenario: ImportScenario) => void }) {
  return <section className="scenario-section section" aria-labelledby="scenario-title">
    <div className="section-header scenario-heading">
      <div><p className="eyebrow">Données d’exemple</p><h2 id="scenario-title">Voyez RevPilot réagir à huit situations différentes.</h2><p>Chargez un scénario instantanément ou téléchargez son CSV pour tester l’import manuel.</p></div>
    </div>
    <div className="scenario-grid">
      {importScenarios.map((scenario) => {
        const loading = loadingId === scenario.id
        const active = activeId === scenario.id
        return <article className={`scenario-card ${active ? 'active' : ''}`} key={scenario.id}>
          <span className="scenario-icon"><FileSpreadsheet size={18} /></span>
          <div className="scenario-card-copy"><h3>{scenario.title}</h3><p>{scenario.description}</p></div>
          <div className="scenario-badges">{scenario.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
          <div className="scenario-actions">
            <button className="btn primary" disabled={Boolean(loadingId)} onClick={() => onLoad(scenario)} aria-label={`Charger le scénario ${scenario.title}`}>
              {loading ? <LoaderCircle className="spin" size={15} /> : <Play size={15} />}{loading ? 'Chargement…' : active ? 'Scénario actif' : 'Charger'}
            </button>
            <a className="btn secondary" href={scenarioHref(scenario)} download={scenario.filename} aria-label={`Télécharger le CSV ${scenario.title}`}><Download size={15} /> CSV</a>
          </div>
        </article>
      })}
    </div>
    <p className="scenario-status" aria-live="polite">{loadingId ? 'Le fichier est chargé et analysé avec les mêmes règles qu’un import local.' : activeId ? 'Le scénario sélectionné est actif.' : 'Aucun scénario du catalogue n’est actuellement chargé.'}</p>
  </section>
}
