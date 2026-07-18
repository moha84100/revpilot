import { ArrowDown, ArrowRight, ArrowUp, CheckCircle2, X } from 'lucide-react'
import type { ImportComparison } from '../lib/importComparison'
import { formatPercent } from '../lib/format'

function Delta({ value, percent = false }: { value: number; percent?: boolean }) {
  const rounded = percent ? Math.round(value * 100) : value
  if (!rounded) return <span className="comparison-delta stable"><ArrowRight size={13} /> stable</span>
  return <span className={`comparison-delta ${rounded > 0 ? 'up' : 'down'}`}>
    {rounded > 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{rounded > 0 ? '+' : ''}{rounded}{percent ? ' pts' : ''}
  </span>
}

function Metric({ label, before, after, percent = false }: { label: string; before: number; after: number; percent?: boolean }) {
  return <div className="comparison-metric"><span>{label}</span><div><small>{percent ? formatPercent(before) : before}</small><ArrowRight size={14} /><strong>{percent ? formatPercent(after) : after}</strong></div><Delta value={after - before} percent={percent} /></div>
}

export function ImportComparisonPanel({ comparison, onClose }: { comparison: ImportComparison; onClose: () => void }) {
  return <section className="comparison-panel" aria-labelledby="comparison-title" aria-live="polite">
    <button className="comparison-close" onClick={onClose} aria-label="Fermer le bilan de l’import"><X size={17} /></button>
    <div className="comparison-intro"><span><CheckCircle2 size={19} /></span><div><p className="eyebrow">Analyse mise à jour</p><h2 id="comparison-title">{comparison.sourceName}</h2><p>{comparison.nextDates} dates analysées · {comparison.insight}</p></div></div>
    <div className="comparison-grid">
      <Metric label="Occupation" {...comparison.occupancy} percent />
      <Metric label="Hausses" {...comparison.increases} />
      <Metric label="À corriger" {...comparison.decreases} />
      <Metric label="Surbookings" {...comparison.overbookings} />
    </div>
  </section>
}
