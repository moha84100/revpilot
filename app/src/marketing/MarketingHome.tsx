import {
  ArrowRight, BarChart3, BellRing, CalendarSearch, Check, ChevronRight,
  Database, Gauge, Hotel, LineChart, LockKeyhole, ShieldCheck,
  Sparkles, TrendingUp,
} from 'lucide-react'
import { Reveal } from '../components/ui/Reveal'
import './marketing.css'

const previewDates = [
  { day: '24', month: 'Juil.', occupancy: '91 %', signal: 'Hausse conseillée', price: '+ 18 €', tone: 'gold' },
  { day: '27', month: 'Juil.', occupancy: '84 %', signal: 'Événement détecté', price: '+ 12 €', tone: 'sage' },
  { day: '02', month: 'Août', occupancy: '52 %', signal: 'Demande à stimuler', price: '− 9 €', tone: 'stone' },
]

const steps = [
  { number: '01', title: 'Détecter', text: 'RevPilot repère les dates qui accélèrent, ralentissent ou dépassent la capacité attendue.' },
  { number: '02', title: 'Expliquer', text: 'Occupation, rythme, historique et événements locaux sont réunis dans une raison lisible.' },
  { number: '03', title: 'Décider', text: 'Vous validez, ajustez ou ignorez chaque recommandation. La décision finale reste la vôtre.' },
]

function Brand() {
  return <span className="marketing-brand"><span className="marketing-brand-mark"><BarChart3 size={18} /></span><span>RevPilot</span></span>
}

function DemandCurve() {
  return <svg className="demand-curve" viewBox="0 0 760 220" role="img" aria-label="Courbe illustrant une accélération de la demande hôtelière">
    <defs>
      <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b99656" stopOpacity=".28" /><stop offset="1" stopColor="#b99656" stopOpacity="0" /></linearGradient>
    </defs>
    <path className="curve-area" d="M2 190 C80 178 102 154 158 162 C228 173 247 118 314 132 C385 147 409 92 476 106 C547 120 577 54 642 70 C688 81 714 34 758 26 L758 218 L2 218 Z" fill="url(#curveFill)" />
    <path className="curve-line" d="M2 190 C80 178 102 154 158 162 C228 173 247 118 314 132 C385 147 409 92 476 106 C547 120 577 54 642 70 C688 81 714 34 758 26" />
    {[{x:158,y:162},{x:314,y:132},{x:476,y:106},{x:642,y:70},{x:758,y:26}].map((point, index) => <circle key={index} className="curve-dot" cx={point.x} cy={point.y} r="5" />)}
  </svg>
}

function ProductPreview() {
  return <><p className="sr-only">Aperçu du tableau de bord RevPilot avec occupation, potentiel estimé, courbe de demande et trois recommandations tarifaires.</p><div className="product-preview" aria-hidden="true">
    <aside className="preview-rail" aria-hidden="true">
      <Brand />
      <div className="preview-hotel"><span><Hotel size={14} /></span><div><b>Maison Lumière</b><small>48 chambres · Orange</small></div></div>
      <div className="preview-nav"><i className="active" /><i /><i /><i /></div>
      <div className="preview-secure"><ShieldCheck size={14} /><span>Données protégées</span></div>
    </aside>
    <div className="preview-main">
      <div className="preview-top"><div><small>VENDREDI 18 JUILLET</small><strong>Les décisions qui comptent.</strong></div><span className="preview-avatar">ML</span></div>
      <div className="preview-sync"><Check size={13} /><span><b>Données synchronisées</b> · Scénario de démonstration</span></div>
      <div className="preview-kpis"><article><small>Occupation moyenne</small><strong>78,4 %</strong><span>+ 6 pts vs N−1</span></article><article className="featured"><small>Potentiel estimé</small><strong>+ 8 420 €</strong><span>À confirmer par l’hôtelier</span></article><article><small>Dates à surveiller</small><strong>7</strong><span>3 prioritaires aujourd’hui</span></article></div>
      <div className="preview-analysis">
        <article className="preview-chart"><div className="preview-panel-head"><span><small>RYTHME DE RÉSERVATION</small><b>Une demande qui s’accélère</b></span><TrendingUp size={16} /></div><DemandCurve /><div className="chart-labels"><span>15 juil.</span><span>30 juil.</span><span>15 août</span></div></article>
        <article className="preview-insight"><span className="preview-spark"><Sparkles size={16} /></span><small>OPPORTUNITÉ PRIORITAIRE</small><strong>Le 24 juillet se vend plus vite que prévu.</strong><p>91 % d’occupation, pickup supérieur à N−1 et événement local confirmé.</p><span className="preview-action">Voir la recommandation <ArrowRight size={13} /></span></article>
      </div>
      <div className="preview-date-list">{previewDates.map((item) => <article key={item.day}><span className="preview-date"><b>{item.day}</b><small>{item.month}</small></span><span><b>{item.occupancy} occupé</b><small>{item.signal}</small></span><span className={`preview-price ${item.tone}`}><b>{item.price}</b><small>proposition</small></span><ChevronRight size={15} /></article>)}</div>
    </div>
  </div></>
}

export default function MarketingHome() {
  return <div className="marketing-site">
    <a className="skip-link" href="#contenu">Aller au contenu</a>
    <header className="marketing-header">
      <a href="./" className="marketing-logo" aria-label="RevPilot, accueil"><Brand /></a>
      <nav aria-label="Navigation principale"><a href="#methode">Méthode</a><a href="#produit">Produit</a><a href="#confiance">Confiance</a></nav>
      <a className="marketing-header-cta" href="./app/">Explorer la démo <ArrowRight size={15} /></a>
    </header>

    <main id="contenu">
      <section className="marketing-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-copy">
          <p className="marketing-eyebrow"><span /> Revenue management pour hôtels indépendants</p>
          <h1>Voir plus tôt.<br />Comprendre vraiment.<br /><em>Décider sereinement.</em></h1>
          <p className="hero-lead">RevPilot transforme vos données de réservation en recommandations tarifaires claires, expliquées et toujours soumises à votre décision.</p>
          <div className="hero-actions"><a className="marketing-btn primary" href="./app/">Explorer la démo <ArrowRight size={17} /></a><a className="marketing-btn ghost" href="#methode">Voir comment ça fonctionne</a></div>
          <div className="hero-assurances"><span><ShieldCheck size={14} /> Lecture seule</span><span><Check size={14} /> Décision humaine</span><span><LockKeyhole size={14} /> Données maîtrisées</span></div>
        </div>
        <div className="hero-preview-wrap"><span className="preview-label"><i /> Scénario de démonstration</span><ProductPreview /></div>
      </section>

      <section className="marketing-trustline" aria-label="Capacités principales"><span>Occupation</span><i /><span>Pickup</span><i /><span>Année précédente</span><i /><span>Événements locaux</span><i /><span>Décision expliquée</span></section>

      <section className="marketing-problem section-shell" id="methode">
        <Reveal className="section-intro"><p className="marketing-eyebrow"><span /> Le vrai problème</p><h2>Le bon tarif ne devrait pas dépendre d’un signal repéré trop tard.</h2><p>Les hôtels disposent déjà des données. Ce qui manque, c’est une lecture quotidienne capable de faire ressortir l’essentiel sans transformer le directeur en analyste.</p></Reveal>
        <div className="problem-grid">
          <Reveal delay={80}><article><span className="problem-icon"><CalendarSearch /></span><h3>Les dates se vendent à des rythmes différents</h3><p>Une moyenne mensuelle masque les accélérations qui exigent une action immédiate.</p></article></Reveal>
          <Reveal delay={160}><article><span className="problem-icon"><Gauge /></span><h3>Les signaux sont difficiles à relier</h3><p>Occupation, pickup, prix moyen et contexte local doivent raconter la même histoire.</p></article></Reveal>
          <Reveal delay={240}><article><span className="problem-icon"><LineChart /></span><h3>Une recommandation opaque ne crée pas la confiance</h3><p>RevPilot expose la raison, le niveau de confiance et l’impact estimé avant toute décision.</p></article></Reveal>
        </div>
      </section>

      <section className="workflow-section section-shell">
        <Reveal><div className="section-kicker">Une routine de décision, pas un écran de plus.</div></Reveal>
        <div className="workflow-grid">{steps.map((step, index) => <Reveal key={step.number} delay={index * 110}><article><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></article></Reveal>)}</div>
      </section>

      <section className="product-story section-shell" id="produit">
        <Reveal className="product-story-copy"><p className="marketing-eyebrow"><span /> Le produit en situation</p><h2>Votre matinée commence par une priorité, pas par un tableau.</h2><p>La vue simple met les dates importantes en premier. La vue avancée reste disponible pour comprendre les indicateurs, comparer les canaux et contrôler les hypothèses.</p><a href="./app/">Ouvrir le tableau de bord <ArrowRight size={15} /></a></Reveal>
        <Reveal className="story-card" delay={100}><div className="story-card-top"><span><i /> PRIORITÉ DU JOUR</span><span>Confiance 92 %</span></div><div className="story-date"><strong>24</strong><span>JUILLET<br /><small>Dans 6 jours</small></span></div><h3>La demande accélère plus vite que l’année précédente.</h3><p>91 % des chambres sont déjà vendues. Le pickup des sept derniers jours dépasse N−1 et un événement de 4 500 personnes est confirmé à proximité.</p><div className="story-decision"><span><small>ACTION ENVISAGÉE</small><b>Augmenter de 18 €</b></span><span><small>POTENTIEL ESTIMÉ</small><b>+ 684 €</b></span></div><div className="story-actions" aria-hidden="true"><span>Ignorer</span><span>Ajuster</span><span className="accept">Valider la recommandation <Check size={15} /></span></div></Reveal>
      </section>

      <section className="capabilities-section section-shell">
        <Reveal className="section-intro compact"><p className="marketing-eyebrow"><span /> Une lecture complète</p><h2>Tout le contexte utile. Rien qui détourne de la décision.</h2></Reveal>
        <div className="capability-grid">
          <Reveal><article className="capability-card large"><span className="capability-icon"><Database /></span><h3>Vos données PMS, sans changer vos habitudes</h3><p>Import CSV ou connexion Mews en lecture seule. RevPilot normalise les réservations puis recalcule les signaux.</p><div className="mini-data"><span><b>12 215</b><small>réservations analysées</small></span><span><b>180</b><small>dates disponibles</small></span><span><b>0</b><small>prix modifié automatiquement</small></span></div></article></Reveal>
          <Reveal delay={100}><article className="capability-card"><span className="capability-icon"><CalendarSearch /></span><h3>Contexte local</h3><p>Les événements proches enrichissent la comparaison au lieu de traiter deux dates comme identiques.</p></article></Reveal>
          <Reveal delay={180}><article className="capability-card dark"><span className="capability-icon"><BellRing /></span><h3>Alertes qui respectent le rythme de l’hôtel</h3><p>E-mail, SMS, WhatsApp et navigateur, avec priorité au surbooking et plages silencieuses.</p></article></Reveal>
        </div>
      </section>

      <section className="trust-section section-shell" id="confiance">
        <Reveal className="trust-copy"><p className="marketing-eyebrow light"><span /> La confiance par la clarté</p><h2>RevPilot conseille.<br />L’hôtelier décide.</h2><p>Aucune boîte noire ne devrait piloter seule le revenu d’un hôtel. Chaque signal reste traçable, chaque hypothèse visible et chaque décision réversible.</p><a className="marketing-btn champagne" href="./app/">Tester avec les données de démonstration <ArrowRight size={17} /></a></Reveal>
        <div className="trust-list">
          <Reveal delay={80}><article><ShieldCheck /><span><h3>Connexion PMS en lecture seule</h3><p>Le prototype récupère les données utiles sans envoyer de tarif au PMS.</p></span></article></Reveal>
          <Reveal delay={160}><article><LineChart /><span><h3>Recommandations explicables</h3><p>La raison, le contexte et la confiance accompagnent chaque action proposée.</p></span></article></Reveal>
          <Reveal delay={240}><article><LockKeyhole /><span><h3>Contrôle humain obligatoire</h3><p>Aucun prix n’est modifié automatiquement. Vous acceptez, ajustez ou ignorez.</p></span></article></Reveal>
        </div>
      </section>

      <section className="integration-section section-shell"><Reveal><p className="marketing-eyebrow"><span /> Connecteurs présents dans le prototype</p><div className="integration-row"><span>Mews</span><span>Ticketmaster</span><span>OpenAgenda</span><span>PredictHQ</span><span>Brevo</span></div><p className="integration-note">Leur disponibilité en direct dépend de la configuration des clés et services associés.</p></Reveal></section>

      <section className="final-cta section-shell"><Reveal><span className="cta-orbit" aria-hidden="true" /><p className="marketing-eyebrow light"><span /> Prêt à regarder les bonnes dates ?</p><h2>Découvrez ce que vos réservations essaient déjà de vous dire.</h2><p>Explorez le scénario hôtelier complet et suivez une recommandation de la détection jusqu’à la décision.</p><a className="marketing-btn champagne" href="./app/">Explorer la démo RevPilot <ArrowRight size={17} /></a></Reveal></section>
    </main>

    <footer className="marketing-footer"><Brand /><p>Prototype consultatif de revenue management hôtelier.</p><span>© 2026 RevPilot</span></footer>
  </div>
}
