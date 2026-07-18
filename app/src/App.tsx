import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle, ArrowRight, BarChart3, Bell, CalendarDays, Check, CheckCircle2,
  ChevronRight, CircleHelp, Clock3, Database, Download, Euro, FileSpreadsheet, Gauge, History,
  Hotel, Info, LayoutDashboard, Mail, Menu, MessageSquare, Presentation, RefreshCw,
  Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Smartphone, TrendingDown,
  TrendingUp, Upload, X,
} from 'lucide-react'
import { createSyntheticHotelDataset, reservationsToCsv } from './data/syntheticReservations'
import { analyzeData, summarize } from './lib/analysis'
import { exampleCsv, parseCsvFile } from './lib/csv'
import { formatCurrency, formatDate, formatPercent } from './lib/format'
import type { AnalyzedDate, Signal } from './types'
import { enrichWithLiveEvents } from './events/enrichment'
import { fetchCityEvents, type EventApiResponse } from './events/provider'
import type { CityEvent } from './events/types'
import { fetchPmsStatus, syncPms, type PmsStatus } from './pms/provider'
import {
  fetchNotificationStatus, sendExternalNotification, sendTestNotification,
  type ExternalChannel, type NotificationProviderStatus,
} from './notifications/provider'
import {
  defaultNotificationPreferences, notificationsFromRows, readStored,
  type InterfaceMode, type NotificationPreferences, type PricingDecision, type RevNotification,
} from './lib/workflow'
import { VideoPresentationBadge } from './presentation/VideoPresentationBadge'
import { VIDEO_REFERENCE_DATE, isVideoPresentation } from './presentation/videoPresentation'
import './styles.css'
import './premium.css'

type Filter = 'all' | Signal

const signalMeta = {
  overbook: { label: 'Surbooking', icon: AlertTriangle },
  increase: { label: 'À augmenter', icon: TrendingUp },
  decrease: { label: 'À baisser', icon: TrendingDown },
  boost: { label: 'À stimuler', icon: TrendingDown },
  maintain: { label: 'Stable', icon: Check },
} as const

const initialDataset = createSyntheticHotelDataset()
const OccupancyChart = lazy(() => import('./components/OccupancyChart'))

function downloadText(content: string, filename: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function useEscapeToClose(onClose: () => void) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
}

function DashboardApp() {
  const demoParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const videoPresentation = useMemo(() => isVideoPresentation(window.location.search), [])
  const fileInput = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState(() => analyzeData(initialDataset.dailyData, videoPresentation ? VIDEO_REFERENCE_DATE : undefined))
  const [sourceName, setSourceName] = useState('Scénario hôtelier volumétrique')
  const [recordCount, setRecordCount] = useState(initialDataset.reservations.length)
  const [rawReservations, setRawReservations] = useState(initialDataset.reservations)
  const [liveEvents, setLiveEvents] = useState<CityEvent[]>([])
  const [eventApi, setEventApi] = useState<EventApiResponse | null>(null)
  const [eventApiError, setEventApiError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [horizon, setHorizon] = useState(30)
  const [selected, setSelected] = useState<AnalyzedDate | null>(null)
  const [toast, setToast] = useState('')
  const [presentationOpen, setPresentationOpen] = useState(() => demoParams.get('demoPanel') === 'presentation')
  const [mobileNav, setMobileNav] = useState(false)
  const [interfaceMode, setInterfaceMode] = useState<InterfaceMode>(() => demoParams.get('demoMode') === 'advanced' ? 'advanced' : readStored('revpilot-mode', 'simple'))
  const [decisions, setDecisions] = useState<Record<string, PricingDecision>>(() => videoPresentation ? {} : readStored('revpilot-decisions', {}))
  const [notificationOpen, setNotificationOpen] = useState(() => demoParams.get('demoPanel') === 'notifications')
  const [settingsOpen, setSettingsOpen] = useState(() => demoParams.get('demoPanel') === 'settings')
  const [readNotifications, setReadNotifications] = useState<string[]>(() => videoPresentation ? [] : readStored('revpilot-read-notifications', []))
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => ({ ...defaultNotificationPreferences, ...readStored('revpilot-notification-preferences', {}) }))
  const [notificationProvider, setNotificationProvider] = useState<NotificationProviderStatus | null>(null)
  const [notificationSending, setNotificationSending] = useState<ExternalChannel | 'alert' | null>(null)
  const [pmsOpen, setPmsOpen] = useState(false)
  const [pmsStatus, setPmsStatus] = useState<PmsStatus | null>(null)
  const [pmsSyncing, setPmsSyncing] = useState<'mews' | 'demo' | null>(null)
  const [pmsError, setPmsError] = useState('')
  const [pmsWarnings, setPmsWarnings] = useState<string[]>([])
  const [activePms, setActivePms] = useState<string | null>(null)

  const analysisRows = useMemo(() => rows.slice(0, Math.min(horizon, rows.length)), [rows, horizon])
  const summary = useMemo(() => summarize(analysisRows), [analysisRows])
  const alerts = useMemo(
    () => analysisRows.filter((row) => row.signal !== 'maintain').sort((a, b) => {
      const priority: Record<Signal, number> = { overbook: 5, decrease: 4, increase: 3, boost: 2, maintain: 1 }
      return priority[b.signal] - priority[a.signal] || b.potentialRevenue - a.potentialRevenue
    }),
    [analysisRows],
  )
  const visibleRows = filter === 'all' ? analysisRows : analysisRows.filter((row) => row.signal === filter)
  const occupancyGap = summary.averageOccupancy - summary.lastYearAverageOccupancy
  const topInsight = alerts[0]
  const priorityIncreaseDate = alerts.find((row) => row.signal === 'increase')?.date
  const presentationAlerts = videoPresentation && priorityIncreaseDate
    ? [alerts.find((row) => row.date === priorityIncreaseDate)!, ...alerts.filter((row) => row.date !== priorityIncreaseDate)]
    : alerts
  const notifications = useMemo(() => notificationsFromRows(analysisRows), [analysisRows])
  const unreadCount = notifications.filter((item) => !readNotifications.includes(item.id)).length
  const decisionHistory = useMemo(() => Object.values(decisions).sort((a, b) => b.decidedAt.localeCompare(a.decidedAt)), [decisions])
  const channelStats = useMemo(() => {
    const total = Math.max(1, rawReservations.length)
    return ['Direct', 'Booking.com', 'Expedia', 'Corporate', 'Group'].map((channel) => ({
      channel,
      count: rawReservations.filter((reservation) => reservation.channel === channel).length,
      share: rawReservations.filter((reservation) => reservation.channel === channel).length / total,
    }))
  }, [rawReservations])

  useEffect(() => {
    if (demoParams.get('demoPanel') === 'decision' && alerts[0]) {
      setSelected(videoPresentation ? alerts.find((row) => row.signal === 'increase') ?? alerts[0] : alerts[0])
    }
    if (demoParams.get('demoSection') === 'advanced') {
      window.setTimeout(() => document.querySelector('#advanced')?.scrollIntoView(), 700)
    }
    // Paramètres réservés aux captures de la vidéo commerciale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (videoPresentation) return
    fetchPmsStatus().then((status) => {
      setPmsStatus(status)
      setActivePms(status.activeProvider)
    }).catch(() => setPmsStatus(null))
  }, [videoPresentation])

  useEffect(() => {
    if (videoPresentation) return
    fetchNotificationStatus().then(setNotificationProvider).catch(() => setNotificationProvider(null))
  }, [videoPresentation])

  useEffect(() => { if (!videoPresentation) window.localStorage.setItem('revpilot-mode', JSON.stringify(interfaceMode)) }, [interfaceMode, videoPresentation])
  useEffect(() => { if (!videoPresentation) window.localStorage.setItem('revpilot-decisions', JSON.stringify(decisions)) }, [decisions, videoPresentation])
  useEffect(() => { if (!videoPresentation) window.localStorage.setItem('revpilot-read-notifications', JSON.stringify(readNotifications)) }, [readNotifications, videoPresentation])
  useEffect(() => { if (!videoPresentation) window.localStorage.setItem('revpilot-notification-preferences', JSON.stringify(notificationPreferences)) }, [notificationPreferences, videoPresentation])

  useEffect(() => {
    if (videoPresentation) return
    fetchCityEvents({
      latitude: 44.1363,
      longitude: 4.8075,
      radiusKm: 35,
      from: '2025-07-15',
      to: '2027-01-10',
    }).then((payload) => {
      setEventApi(payload)
      if (payload.mode === 'live' && payload.events.length) {
        setLiveEvents(payload.events)
        setRows((current) => analyzeData(enrichWithLiveEvents(current, payload.events)))
      }
    }).catch((error) => setEventApiError(error instanceof Error ? error.message : 'Serveur événementiel indisponible.'))
  }, [videoPresentation])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  const enabledExternalChannels = (preferences = notificationPreferences): ExternalChannel[] => [
    preferences.email && 'email', preferences.sms && 'sms', preferences.whatsapp && 'whatsapp',
  ].filter(Boolean) as ExternalChannel[]

  const showBrowserNotification = async (notification: RevNotification) => {
    if (!notificationPreferences.browser || !('Notification' in window)) return false
    const permission = window.Notification.permission === 'default'
      ? await window.Notification.requestPermission()
      : window.Notification.permission
    if (permission !== 'granted') return false
    new window.Notification(notification.title, { body: notification.message, tag: notification.id })
    return true
  }

  const deliverNotification = async (notification: RevNotification, automatic = false) => {
    const channels = enabledExternalChannels()
    const browserSent = await showBrowserNotification(notification)
    if (!channels.length) {
      if (!automatic) showToast(browserSent ? 'Notification navigateur affichée.' : 'Activez au moins un canal externe dans les préférences.')
      return
    }
    if (!automatic) setNotificationSending('alert')
    try {
      const payload = await sendExternalNotification({
        channels,
        recipients: {
          email: notificationPreferences.emailAddress,
          sms: notificationPreferences.phoneNumber,
          whatsapp: notificationPreferences.whatsappNumber,
        },
        notification,
        quietHours: notificationPreferences.quietHours,
      })
      const queued = payload.results.filter((result) => result.status === 'queued').length
      const deferred = payload.results.filter((result) => result.status === 'deferred').length
      const failed = payload.results.filter((result) => result.status === 'failed')
      if (!automatic) showToast(queued ? `${queued} notification(s) mise(s) en envoi.` : deferred ? 'Alerte conservée jusqu’à la fin de la plage silencieuse.' : failed[0]?.reason || 'Aucun message envoyé.')
      fetchNotificationStatus().then(setNotificationProvider).catch(() => undefined)
    } catch (error) {
      if (!automatic) showToast(error instanceof Error ? error.message : 'Envoi impossible.')
    } finally {
      if (!automatic) setNotificationSending(null)
    }
  }

  const dispatchCriticalAlert = (nextRows: AnalyzedDate[]) => {
    if (!notificationPreferences.overbooking) return
    const critical = notificationsFromRows(nextRows).find((notification) => notification.level === 'critical')
    if (critical) void deliverNotification(critical, true)
  }

  const testNotificationChannel = async (channel: ExternalChannel, to: string) => {
    setNotificationSending(channel)
    try {
      const payload = await sendTestNotification(channel, to)
      const result = payload.results[0]
      showToast(result?.status === 'queued' ? `Test ${channel} accepté par Brevo.` : result?.reason || 'Test non envoyé.')
      setNotificationProvider(await fetchNotificationStatus())
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Test impossible.')
    } finally {
      setNotificationSending(null)
    }
  }

  const saveDecision = (decision: PricingDecision) => {
    setDecisions((current) => ({ ...current, [decision.date]: decision }))
    setSelected(null)
    const action = decision.status === 'ignored' ? 'ignorée' : decision.status === 'adjusted' ? 'ajustée et validée' : 'validée'
    showToast(`Recommandation ${action}. La décision est ajoutée à l’historique.`)
  }

  const resetDemo = () => {
    setRows(analyzeData(liveEvents.length ? enrichWithLiveEvents(initialDataset.dailyData, liveEvents) : initialDataset.dailyData))
    setSourceName('Scénario hôtelier volumétrique')
    setRecordCount(initialDataset.reservations.length)
    setRawReservations(initialDataset.reservations)
    setFilter('all')
    setHorizon(30)
    showToast('La démonstration a été réinitialisée.')
  }

  const handleFile = async (file?: File) => {
    if (!file) return
    try {
      const parsed = await parseCsvFile(file)
      const nextRows = analyzeData(liveEvents.length ? enrichWithLiveEvents(parsed.rows, liveEvents) : parsed.rows, new Date())
      setRows(nextRows)
      setSourceName(parsed.sourceName)
      setRecordCount(parsed.recordCount ?? parsed.rows.length)
      setRawReservations([])
      setActivePms(null)
      setPmsWarnings([])
      setFilter('all')
      setHorizon(Math.min(30, parsed.rows.length))
      dispatchCriticalAlert(nextRows)
      showToast(`${parsed.rows.length} dates importées et analysées.`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Import impossible.')
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const handlePmsSync = async (provider: 'mews' | 'demo') => {
    setPmsSyncing(provider)
    setPmsError('')
    try {
      const payload = await syncPms(provider, 90)
      const nextRows = analyzeData(liveEvents.length ? enrichWithLiveEvents(payload.rows, liveEvents) : payload.rows, new Date())
      setRows(nextRows)
      setSourceName(payload.sourceName)
      setRecordCount(payload.recordCount)
      setRawReservations([])
      setActivePms(provider)
      setPmsWarnings(payload.warnings || [])
      setFilter('all')
      setHorizon(Math.min(30, payload.rows.length))
      dispatchCriticalAlert(nextRows)
      setPmsOpen(false)
      showToast(`${payload.providerName} synchronisé : ${payload.recordCount.toLocaleString('fr-FR')} réservations lues.`)
      setPmsStatus((current) => current ? { ...current, activeProvider: provider, status: 'connected', lastSync: payload.syncedAt } : current)
    } catch (error) {
      setPmsError(error instanceof Error ? error.message : 'Synchronisation PMS impossible.')
    } finally {
      setPmsSyncing(null)
    }
  }

  const exportRecommendations = () => {
    const headers = ['date', 'occupation', 'signal', 'recommandation', 'explication', 'confiance', 'potentiel_estime']
    const lines = alerts.map((row) => [
      row.date,
      Math.round(row.occupancy * 100),
      row.signalLabel,
      row.recommendation,
      row.reason,
      row.confidence,
      row.potentialRevenue,
    ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    downloadText(`\ufeff${headers.join(',')}\n${lines.join('\n')}`, 'recommandations-revpilot.csv')
    showToast('Le rapport des recommandations a été téléchargé.')
  }

  const chartData = analysisRows.map((row) => ({
    date: formatDate(row.date, { day: 'numeric', month: 'short' }),
    actuel: Math.round(row.occupancy * 100),
    precedent: Math.round(row.lastYearOccupancy * 100),
  }))

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand-row">
          <a className="brand" href="../" aria-label="RevPilot, revenir au site public">
            <span className="brand-mark"><BarChart3 size={19} /></span>
            <span>RevPilot</span>
          </a>
          <button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Fermer le menu"><X /></button>
        </div>

        <div className="hotel-switcher">
          <span className="hotel-avatar"><Hotel size={17} /></span>
          <span><strong>Grand Hôtel Démo</strong><small>48 chambres · Orange</small></span>
          <ChevronRight size={15} />
        </div>

        <nav>
          <a className="nav-item active" href="#top"><LayoutDashboard size={17} /> Vue du jour</a>
          <a className="nav-item" href="#alerts"><AlertTriangle size={17} /> Dates à surveiller <b>{summary.alerts}</b></a>
          <a className="nav-item" href="#calendar"><CalendarDays size={17} /> Calendrier</a>
          <a className="nav-item" href="#data"><FileSpreadsheet size={17} /> Données PMS</a>
          {interfaceMode === 'advanced' && <>
            <a className="nav-item" href="#advanced"><SlidersHorizontal size={17} /> Pilotage avancé</a>
            <a className="nav-item" href="#history"><History size={17} /> Historique <b>{decisionHistory.length}</b></a>
          </>}
        </nav>

        <button className="presentation-card" onClick={() => setPresentationOpen(true)}>
          <span className="presentation-icon"><Presentation size={18} /></span>
          <span><strong>Mode présentation</strong><small>Le discours simple pour l’hôtelier</small></span>
          <ArrowRight size={15} />
        </button>

        <div className="privacy-card">
          <ShieldCheck size={17} />
          <div><strong>Données protégées</strong><p>Cette démo analyse le fichier localement. Aucun tarif n’est modifié.</p></div>
        </div>

        <div className="sidebar-footer"><span></span> Prototype de validation · v0.1</div>
      </aside>

      <main id="top" className={demoParams.get('demoSection') === 'advanced' ? 'capture-advanced' : ''}>
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Ouvrir le menu"><Menu /></button>
          <div className="topbar-title">
            <p className="eyebrow">Mardi 14 juillet 2026</p>
            <h1>Voici les décisions qui comptent aujourd’hui.</h1>
          </div>
          <div className="top-actions">
            <div className="mode-switch" aria-label="Niveau d'interface">
              <button className={interfaceMode === 'simple' ? 'active' : ''} onClick={() => setInterfaceMode('simple')}>Simple</button>
              <button className={interfaceMode === 'advanced' ? 'active' : ''} onClick={() => setInterfaceMode('advanced')}><Settings2 size={13} /> Avancé</button>
            </div>
            <button className="notification-button" data-video="notifications-trigger" onClick={() => setNotificationOpen(true)} aria-label={`${unreadCount} notifications non lues`}><Bell size={17} />{unreadCount > 0 && <b>{unreadCount}</b>}</button>
            <button className="btn secondary" onClick={() => setPresentationOpen(true)}><Presentation size={16} /> Présenter</button>
            <button className="btn secondary compact" onClick={resetDemo} title="Recharger la démo"><RefreshCw size={16} /></button>
            <button className="btn primary" onClick={() => fileInput.current?.click()}><Upload size={16} /> Importer un export PMS</button>
            <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
          </div>
        </header>

        <div className="source-banner" id="data">
          <span className="source-check"><Check size={15} /></span>
          <div><strong>{sourceName}</strong><p>{recordCount.toLocaleString('fr-FR')} enregistrements · {rows.length} dates disponibles · recommandations recalculées automatiquement</p></div>
          <div className="horizon-control"><span>Horizon</span><select value={horizon} onChange={(event) => setHorizon(Number(event.target.value))}>{[30,60,90,180].filter((value) => value <= rows.length).map((value) => <option key={value} value={value}>{value} jours</option>)}</select></div>
          {videoPresentation ? <VideoPresentationBadge /> : <span className="local-badge"><ShieldCheck size={13} /> {activePms ? 'Lecture PMS sécurisée' : 'Analyse locale'}</span>}
        </div>

        {!videoPresentation && <section className={`pms-strip ${activePms ? 'connected' : ''}`}>
          <div className="pms-strip-title"><Database size={17} /><span><strong>{activePms === 'mews' ? 'Mews connecté' : activePms === 'demo' ? 'PMS de démonstration connecté' : 'Aucun PMS connecté'}</strong><small>{activePms ? 'Données synchronisées en lecture seule · aucun prix envoyé au PMS' : 'Connectez Mews pour remplacer l’import manuel du fichier CSV.'}</small></span></div>
          <div className="pms-strip-actions">
            {pmsWarnings.length > 0 && <span className="pms-warning">{pmsWarnings[0]}</span>}
            <button className="btn secondary" onClick={() => setPmsOpen(true)}><Database size={15} /> {activePms ? 'Gérer la connexion' : 'Connecter un PMS'}</button>
            {activePms && <button className="btn primary" disabled={Boolean(pmsSyncing)} onClick={() => handlePmsSync(activePms as 'mews' | 'demo')}><RefreshCw size={15} className={pmsSyncing ? 'spin' : ''} /> Synchroniser</button>}
          </div>
        </section>}

        {!videoPresentation && <section className={`event-api-strip ${eventApi?.mode === 'live' ? 'live' : eventApiError ? 'error' : 'simulation'}`}>
          <div className="event-api-title"><CalendarDays size={16} /><span><strong>{eventApi?.mode === 'live' ? 'Événements réels connectés' : eventApiError ? 'Serveur événementiel indisponible' : 'Événements en mode simulation'}</strong><small>{eventApi?.mode === 'live' ? `${eventApi.events.length} événements récupérés autour d’Orange` : eventApiError || 'Ajoutez au moins une clé API pour remplacer les événements fictifs.'}</small></span></div>
          <div className="provider-list">
            {(eventApi?.providers ?? [
              { name: 'Ticketmaster', status: 'missing_key', count: 0 },
              { name: 'OpenAgenda', status: 'missing_key', count: 0 },
              { name: 'PredictHQ', status: 'missing_key', count: 0 },
            ]).map((provider) => <span key={provider.name} className={provider.status}><i />{provider.name}{provider.status === 'connected' ? ` · ${provider.count}` : provider.status === 'error' ? ' · erreur' : ' · clé absente'}</span>)}
          </div>
        </section>}

        <section className="kpi-grid" aria-label="Indicateurs clés">
          <KpiCard label="Occupation moyenne" value={formatPercent(summary.averageOccupancy)} icon={<Gauge />} tone="blue">
            <span className={occupancyGap >= 0 ? 'positive' : 'negative'}>{occupancyGap >= 0 ? '+' : ''}{Math.round(occupancyGap * 100)} pts</span> par rapport à N-1
          </KpiCard>
          <KpiCard label="Chiffre d’affaires prévu" value={formatCurrency(summary.forecastRevenue)} icon={<Euro />} tone="purple">Sur les {analysisRows.length} prochaines dates</KpiCard>
          <KpiCard label="Dates à surveiller" value={String(summary.alerts)} icon={<AlertTriangle />} tone="amber" featured>{summary.overbookingDays} surbookings · {summary.increases} hausses · {summary.decreases} baisses</KpiCard>
          <KpiCard videoId="potential-kpi" label="Potentiel estimé" value={`+${formatCurrency(summary.potentialRevenue)}`} icon={<TrendingUp />} tone="green">Estimation à valider avec l’hôtelier</KpiCard>
        </section>

        {interfaceMode === 'advanced' && <section className="operational-grid" aria-label="Indicateurs de performance hôtelière">
          <OperationalMetric label="ADR moyen" value={formatCurrency(summary.averageAdr)} detail="Prix moyen des chambres vendues" />
          <OperationalMetric label="RevPAR" value={formatCurrency(summary.averageRevPAR)} detail="Revenu par chambre disponible" />
          <OperationalMetric label="Part directe" value={formatPercent(summary.directShare)} detail="Réservations sans OTA" />
          <OperationalMetric label="Commissions OTA" value={formatCurrency(summary.commissionCost)} detail="Coût estimé sur la période" warning />
          <OperationalMetric label="Contexte local" value={`${summary.eventDays} j`} detail="Jours influencés par un événement" />
        </section>}

        <section className="section" id="alerts">
          <div className="section-header">
            <div><p className="eyebrow">Priorités du jour</p><h2>Les dates qui demandent une décision</h2></div>
            <button className="link-button" onClick={() => document.querySelector('#calendar')?.scrollIntoView()}>Voir les {analysisRows.length} dates <ArrowRight size={14} /></button>
          </div>
          <div className="alert-list">
            {presentationAlerts.slice(0, interfaceMode === 'simple' ? 4 : 6).map((row) => <AlertCard key={row.date} videoId={row.date === priorityIncreaseDate ? 'priority-increase' : undefined} row={row} decision={decisions[row.date]} onClick={() => setSelected(row)} />)}
            {!alerts.length && <div className="empty-state"><Check size={24} /><strong>Aucune action urgente</strong><p>Les dates analysées évoluent dans la zone attendue.</p></div>}
          </div>
        </section>

        {interfaceMode === 'advanced' && <section className="analytics-grid section">
          <article className="panel chart-panel">
            <div className="panel-header">
              <div><p className="eyebrow">Vision à 30 jours</p><h2>Occupation actuelle et année précédente</h2></div>
            </div>
            <div className="chart-container">
              <Suspense fallback={<div className="chart-loading">Chargement du graphique…</div>}><OccupancyChart data={chartData} /></Suspense>
            </div>
          </article>

          <article className="insight-panel">
            <span className="spark-icon"><Sparkles size={18} /></span>
            <p className="eyebrow">Explication RevPilot</p>
            <h2>{topInsight ? `Une action est recommandée pour le ${formatDate(topInsight.date, { day: 'numeric', month: 'long' })}.` : 'Le rythme est conforme aux attentes.'}</h2>
            <p>{topInsight?.reason ?? 'Aucune anomalie importante n’a été détectée dans les données importées.'}</p>
            {topInsight && <button onClick={() => setSelected(topInsight)}>Comprendre la recommandation <ArrowRight size={14} /></button>}
            <div className="insight-foot"><Info size={15} /><span>Le logiciel explique chaque signal. La décision finale appartient toujours à l’hôtelier.</span></div>
          </article>
        </section>}

        <section className="section" id="calendar">
          <div className="section-header table-heading">
            <div><p className="eyebrow">Calendrier de décision</p><h2>Toutes les dates analysées</h2></div>
            <div className="table-actions">
              <div className="filters">
                {(['all', 'overbook', 'increase', 'decrease', 'boost', 'maintain'] as Filter[]).map((value) => (
                  <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>
                    {value === 'all' ? 'Toutes' : signalMeta[value].label}
                  </button>
                ))}
              </div>
              <button className="btn secondary" onClick={exportRecommendations}><Download size={15} /> Exporter</button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Événement local</th><th>Occupation</th><th>Réservations 7 j</th><th>Prix moyen</th><th>Signal</th><th>Recommandation</th><th></th></tr></thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.date} onClick={() => setSelected(row)}>
                    <td><strong>{formatDate(row.date)}</strong><small>J-{row.daysUntilArrival}</small></td>
                    <td>{row.eventName ? <span className="event-pill"><CalendarDays size={11} />{row.eventName}<small>{row.eventAttendance.toLocaleString('fr-FR')} participants · {row.eventSource}</small></span> : row.lastYearEventName ? <span className="event-pill previous"><CalendarDays size={11} />Absent cette année<small>N-1 : {row.lastYearEventName}</small></span> : <span className="no-event">Aucun événement majeur</span>}</td>
                    <td className="occupancy-cell"><strong>{formatPercent(row.occupancy)}</strong><span className="mini-bar"><i className={row.overbookedRooms ? 'overbooked' : ''} style={{ width: `${Math.min(100, row.occupancy * 100)}%` }} /></span></td>
                    <td><strong>{row.pickup7d}</strong><small>{row.paceGap >= 0 ? '+' : ''}{row.paceGap} vs N-1</small></td>
                    <td><strong>{formatCurrency(row.adr)}</strong></td>
                    <td><SignalBadge signal={row.signal} label={row.signalLabel} /></td>
                    <td><strong>{row.recommendation}</strong></td>
                    <td><button className="row-open" onClick={(event) => { event.stopPropagation(); setSelected(row) }} aria-label={`Ouvrir la recommandation du ${formatDate(row.date)}`}><ChevronRight size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {interfaceMode === 'advanced' && <AdvancedWorkspace
          rows={analysisRows}
          decisions={decisionHistory}
          channelStats={channelStats}
          preferences={notificationPreferences}
          onOpenSettings={() => setSettingsOpen(true)}
        />}

        <section className="import-help section">
          <div className="help-icon"><FileSpreadsheet size={22} /></div>
          <div><p className="eyebrow">Données de test</p><h2>Le scénario complet et un exemple d’import sont disponibles.</h2><p>Le grand fichier contient les réservations individuelles. Le petit CSV permet de tester rapidement l’import journalier.</p></div>
          <div className="download-actions">
            {rawReservations.length > 0 && <button className="btn primary" onClick={() => downloadText(reservationsToCsv(rawReservations), 'reservations-fictives-revpilot.csv')}><Download size={16} /> {rawReservations.length.toLocaleString('fr-FR')} réservations</button>}
            <button className="btn secondary" onClick={() => downloadText(`\ufeff${exampleCsv}`, 'exemple-export-pms.csv')}><Download size={16} /> Exemple journalier</button>
          </div>
        </section>

        <footer>RevPilot · Prototype consultatif de revenue management hôtelier · Aucune modification automatique des prix</footer>
      </main>

      {selected && <DetailDrawer row={selected} decision={decisions[selected.date]} onClose={() => setSelected(null)} onDecision={saveDecision} />}
      {notificationOpen && <NotificationDrawer notifications={notifications} read={readNotifications} sending={notificationSending === 'alert'} onSend={(notification) => deliverNotification(notification)} onRead={(id) => setReadNotifications((current) => current.includes(id) ? current : [...current, id])} onReadAll={() => setReadNotifications(notifications.map((item) => item.id))} onSettings={() => { setNotificationOpen(false); setSettingsOpen(true) }} onClose={() => setNotificationOpen(false)} />}
      {settingsOpen && <NotificationSettings preferences={notificationPreferences} provider={notificationProvider} sending={notificationSending} onTest={testNotificationChannel} onSave={async (preferences) => { setNotificationPreferences(preferences); if (preferences.browser && 'Notification' in window && window.Notification.permission === 'default') await window.Notification.requestPermission(); setSettingsOpen(false); showToast('Préférences de notification enregistrées.') }} onClose={() => setSettingsOpen(false)} />}
      {presentationOpen && <PresentationModal onClose={() => setPresentationOpen(false)} onImport={() => { setPresentationOpen(false); fileInput.current?.click() }} />}
      {pmsOpen && <PmsConnectionModal status={pmsStatus} syncing={pmsSyncing} error={pmsError} onSync={handlePmsSync} onImport={() => { setPmsOpen(false); fileInput.current?.click() }} onClose={() => { setPmsOpen(false); setPmsError('') }} />}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  )
}

function PmsConnectionModal({ status, syncing, error, onSync, onImport, onClose }: {
  status: PmsStatus | null
  syncing: 'mews' | 'demo' | null
  error: string
  onSync: (provider: 'mews' | 'demo') => void
  onImport: () => void
  onClose: () => void
}) {
  useEscapeToClose(onClose)
  const mews = status?.providers.find((provider) => provider.id === 'mews')
  return <div className="overlay modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="settings-modal pms-modal" role="dialog" aria-modal="true" aria-labelledby="pms-dialog-title">
    <button className="modal-close" onClick={onClose} aria-label="Fermer" autoFocus><X /></button>
    <p className="eyebrow">Connexion sécurisée</p><h2 id="pms-dialog-title">Connecter les réservations de l’hôtel</h2>
    <p className="settings-intro">Les jetons API restent sur le serveur. Cette première connexion est uniquement en lecture : RevPilot ne peut ni modifier une réservation ni envoyer un prix.</p>
    {error && <div className="pms-error"><AlertTriangle size={16} />{error}</div>}
    <div className="pms-options">
      <article className={`pms-option ${mews?.configured ? 'ready' : ''}`}>
        <span className="pms-logo">M</span><div><h3>Mews</h3><p>Capacité, réservations confirmées, pickup des sept derniers jours et comparaison avec N‑1.</p><span className={`connection-state ${mews?.configured ? 'ready' : ''}`}><i />{mews?.configured ? `Jetons configurés · environnement ${mews.environment}` : 'Identifiants API nécessaires'}</span></div>
        {mews?.configured
          ? <button className="btn primary" disabled={Boolean(syncing)} onClick={() => onSync('mews')}><RefreshCw size={15} className={syncing === 'mews' ? 'spin' : ''} /> Synchroniser</button>
          : <div className="pms-command"><strong>Sur le Mac :</strong><code>./configure-pms.sh</code><small>Puis relancez RevPilot.</small></div>}
      </article>
      <article className="pms-option">
        <span className="pms-logo demo">D</span><div><h3>Connexion de démonstration</h3><p>Teste tout le parcours sans utiliser les données d’un véritable hôtel.</p><span className="connection-state ready"><i />Disponible immédiatement</span></div>
        <button className="btn secondary" disabled={Boolean(syncing)} onClick={() => onSync('demo')}><RefreshCw size={15} className={syncing === 'demo' ? 'spin' : ''} /> Tester</button>
      </article>
      <article className="pms-option compact-option">
        <span className="pms-logo csv"><FileSpreadsheet size={18} /></span><div><h3>Autre PMS</h3><p>Cloudbeds, Opera, RoomRaccoon… conservez temporairement l’import CSV pendant le développement du connecteur correspondant.</p></div>
        <button className="btn secondary" onClick={onImport}>Importer un CSV</button>
      </article>
    </div>
    <div className="pms-security"><ShieldCheck size={17} /><p><strong>Sécurité :</strong> aucune clé API n’est stockée dans le navigateur ou affichée dans l’interface.</p></div>
  </section></div>
}

function KpiCard({ label, value, icon, tone, featured, videoId, children }: { label: string; value: string; icon: React.ReactNode; tone: string; featured?: boolean; videoId?: string; children: React.ReactNode }) {
  return <article className={`kpi-card ${featured ? 'featured' : ''}`} data-video={videoId}>
    <div className="kpi-label"><span>{label}</span><span className={`kpi-icon ${tone}`}>{icon}</span></div>
    <strong className="kpi-value">{value}</strong>
    <p>{children}</p>
  </article>
}

function OperationalMetric({ label, value, detail, warning }: { label: string; value: string; detail: string; warning?: boolean }) {
  return <article className={`operational-metric ${warning ? 'warning' : ''}`}>
    <span>{label}</span><strong>{value}</strong><small>{detail}</small>
  </article>
}

function SignalBadge({ signal, label }: { signal: Signal; label: string }) {
  const Icon = signalMeta[signal].icon
  return <span className={`signal ${signal}`}><Icon size={12} />{label}</span>
}

function AlertCard({ row, decision, onClick, videoId }: { row: AnalyzedDate; decision?: PricingDecision; onClick: () => void; videoId?: string }) {
  const date = new Date(`${row.date}T12:00:00`)
  return <button className={`alert-card ${row.signal}`} data-video={videoId} onClick={onClick}>
    <span className="date-tile"><b>{date.getDate()}</b><small>{formatDate(row.date, { month: 'short' })}</small></span>
    <span className="alert-metric"><b>{formatPercent(row.occupancy)} occupé</b><small>{row.roomsSold}/{row.roomsAvailable} chambres vendues</small></span>
    <span className="alert-reason"><b>{row.signalLabel}</b><small>{row.reason}</small></span>
    <span className="alert-action"><b>{decision ? decision.status === 'ignored' ? 'Décision ignorée' : `Validé à ${formatCurrency(decision.decidedPrice)}` : row.recommendation}</b><small>{decision ? 'Décision enregistrée dans l’historique' : `Potentiel estimé : ${formatCurrency(row.potentialRevenue)}`}</small></span>
    <span className="confidence"><small>Confiance {row.confidence} %</small><i><em style={{ width: `${row.confidence}%` }} /></i></span>
    <ChevronRight className="alert-chevron" size={18} />
  </button>
}

function DetailDrawer({ row, decision, onClose, onDecision }: { row: AnalyzedDate; decision?: PricingDecision; onClose: () => void; onDecision: (decision: PricingDecision) => void }) {
  useEscapeToClose(onClose)
  const proposedPrice = Math.max(0, row.currentPrice + row.recommendedDelta)
  const [price, setPrice] = useState(decision?.decidedPrice ?? proposedPrice)
  const [note, setNote] = useState(decision?.note ?? '')
  const decide = (status: PricingDecision['status'], chosenPrice = price) => onDecision({
    date: row.date,
    status,
    signalLabel: row.signalLabel,
    recommendation: row.recommendation,
    previousPrice: row.currentPrice,
    decidedPrice: status === 'ignored' ? row.currentPrice : chosenPrice,
    note,
    decidedAt: new Date().toISOString(),
  })
  return <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <aside className="drawer" data-video="decision-drawer" role="dialog" aria-modal="true" aria-labelledby="decision-dialog-title">
      <div className="drawer-head"><div><p className="eyebrow">Analyse détaillée</p><h2 id="decision-dialog-title">{formatDate(row.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2></div><button onClick={onClose} aria-label="Fermer" autoFocus><X /></button></div>
      <SignalBadge signal={row.signal} label={row.signalLabel} />
      <div className="drawer-hero"><p>Action proposée</p><strong>{row.recommendation}</strong><span data-video="decision-confidence">Confiance du signal : {row.confidence} %</span></div>
      <section><h3>Pourquoi cette recommandation ?</h3><p>{row.reason}</p></section>
      <div className="detail-grid">
        <div><span>Occupation</span><strong>{formatPercent(row.occupancy)}</strong><small>{row.roomsSold} chambres vendues</small></div>
        <div><span>Année précédente</span><strong>{formatPercent(row.lastYearOccupancy)}</strong><small>{row.paceGap >= 0 ? '+' : ''}{row.paceGap} chambres d’écart</small></div>
        <div><span>Pickup 7 jours</span><strong>{row.pickup7d}</strong><small>nouvelles réservations</small></div>
        <div><span>Prix moyen</span><strong>{formatCurrency(row.adr)}</strong><small>sur les ventes actuelles</small></div>
        <div><span>Surbooking</span><strong>{row.overbookedRooms || 0}</strong><small>chambres au-delà de la capacité</small></div>
        <div><span>Annulations 7 j</span><strong>{row.cancellations7d}</strong><small>{formatPercent(row.cancellationRate)} des dossiers récents</small></div>
        <div><span>Part directe</span><strong>{formatPercent(row.directShare)}</strong><small>{row.directRooms} chambres sans OTA</small></div>
        <div><span>RevPAR net</span><strong>{formatCurrency(row.netRevPAR)}</strong><small>après commissions estimées</small></div>
      </div>
      {(row.eventName || row.lastYearEventName) && <section className="event-comparison">
        <div className="event-comparison-title"><CalendarDays size={18} /><div><h3>Comparaison du contexte local</h3><p>RevPilot ne compare pas deux dates comme si leur environnement était identique.</p></div></div>
        <div className="event-columns">
          <div><span>Cette année</span><strong>{row.eventName ?? 'Aucun événement majeur'}</strong><small>{row.eventName ? `${row.eventAttendance.toLocaleString('fr-FR')} participants · impact ${row.eventImpact}/100` : 'Impact 0/100'}</small></div>
          <div><span>Année précédente</span><strong>{row.lastYearEventName ?? 'Aucun événement majeur'}</strong><small>{row.lastYearEventName ? `${row.lastYearEventAttendance.toLocaleString('fr-FR')} participants · impact ${row.lastYearEventImpact}/100` : 'Impact 0/100'}</small></div>
        </div>
      </section>}
      <section className="guardrail"><ShieldCheck size={19} /><div><h3>Garde-fou</h3><p>RevPilot ne change aucun prix. L’hôtelier vérifie le contexte local avant d’accepter ou d’ignorer la recommandation.</p></div></section>
      <section className="decision-form">
        <div><label htmlFor="decision-price">Prix décidé</label><div className="price-input"><input id="decision-price" data-video="decision-price-input" type="number" min="0" value={price} onChange={(event) => setPrice(Number(event.target.value))} /><span>€</span></div><small>Prix actuel : {formatCurrency(row.currentPrice)} · proposition : {formatCurrency(proposedPrice)}</small></div>
        <div><label htmlFor="decision-note">Note interne</label><textarea id="decision-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ex. vérifier le groupe attendu avant diffusion…" /></div>
      </section>
      {decision && <p className="existing-decision"><CheckCircle2 size={15} /> Une décision existe déjà pour cette date. Une nouvelle validation la remplacera.</p>}
      <div className="drawer-actions"><button className="btn secondary" onClick={() => decide('ignored')}>Ignorer</button><button className="btn secondary" onClick={() => decide('adjusted')}>Valider mon prix</button><button className="btn primary" data-video="decision-accept" onClick={() => decide('accepted', proposedPrice)}><Check size={16} /> Accepter</button></div>
    </aside>
  </div>
}

function AdvancedWorkspace({ rows, decisions, channelStats, preferences, onOpenSettings }: {
  rows: AnalyzedDate[]
  decisions: PricingDecision[]
  channelStats: Array<{ channel: string; count: number; share: number }>
  preferences: NotificationPreferences
  onOpenSettings: () => void
}) {
  const eventRows = rows.filter((row) => row.eventName).slice(0, 5)
  const activeChannels = [preferences.inApp && 'Application', preferences.email && 'E-mail', preferences.sms && 'SMS', preferences.whatsapp && 'WhatsApp', preferences.browser && 'Navigateur'].filter(Boolean)
  return <section className="section advanced-workspace" id="advanced">
    <div className="section-header"><div><p className="eyebrow">Centre de pilotage</p><h2>Réglages et contrôles avancés</h2></div><span className="advanced-badge"><SlidersHorizontal size={14} /> Mode avancé actif</span></div>
    <div className="advanced-grid">
      <article className="panel control-panel">
        <div className="control-title"><span><Euro size={18} /></span><div><h3>Règles tarifaires</h3><p>Garde-fous avant toute diffusion vers le PMS.</p></div></div>
        <div className="rule-row"><span>Variation maximale quotidienne</span><strong>± 18 %</strong></div>
        <div className="rule-row"><span>Prix plancher / plafond</span><strong>69 € / 289 €</strong></div>
        <div className="rule-row"><span>Validation humaine</span><strong className="safe">Obligatoire</strong></div>
      </article>
      <article className="panel control-panel">
        <div className="control-title"><span><BarChart3 size={18} /></span><div><h3>Distribution</h3><p>Répartition des réservations par canal.</p></div></div>
        <div className="channel-bars">{channelStats.map((item) => <div key={item.channel}><span>{item.channel}</span><i><em style={{ width: `${item.share * 100}%` }} /></i><strong>{formatPercent(item.share)}</strong></div>)}</div>
      </article>
      <article className="panel control-panel" data-video="events-panel">
        <div className="control-title"><span><CalendarDays size={18} /></span><div><h3>Événements détectés</h3><p>Contexte local influençant la demande.</p></div></div>
        <div className="compact-list">{eventRows.map((row) => <div key={row.date}><span><strong>{row.eventName}</strong><small>{formatDate(row.date)} · impact {row.eventImpact}/100</small></span><SignalBadge signal={row.signal} label={row.signalLabel} /></div>)}{!eventRows.length && <p>Aucun événement majeur sur cet horizon.</p>}</div>
      </article>
      <article className="panel control-panel notification-control">
        <div className="control-title"><span><Bell size={18} /></span><div><h3>Notifications</h3><p>Canaux actifs : {activeChannels.join(', ') || 'aucun'}.</p></div></div>
        <div className="notification-rule"><AlertTriangle size={15} /><span><strong>Surbooking</strong><small>Alerte immédiate, sans attendre le résumé.</small></span><b className={preferences.overbooking ? 'on' : ''}>{preferences.overbooking ? 'Actif' : 'Inactif'}</b></div>
        <div className="notification-rule"><Clock3 size={15} /><span><strong>Résumé quotidien</strong><small>Une synthèse des décisions le matin.</small></span><b className={preferences.dailyDigest ? 'on' : ''}>{preferences.dailyDigest ? 'Actif' : 'Inactif'}</b></div>
        <button className="btn secondary" onClick={onOpenSettings}><Settings2 size={15} /> Configurer les alertes</button>
      </article>
    </div>
    <article className="panel history-panel" id="history">
      <div className="panel-header"><div><p className="eyebrow">Traçabilité</p><h2>Historique des décisions</h2></div><span>{decisions.length} décision(s)</span></div>
      {decisions.length ? <div className="table-wrap"><table><thead><tr><th>Date de séjour</th><th>Décision</th><th>Prix avant</th><th>Prix décidé</th><th>Note</th><th>Horodatage</th></tr></thead><tbody>{decisions.map((decision) => <tr key={`${decision.date}-${decision.decidedAt}`}><td><strong>{formatDate(decision.date)}</strong></td><td><span className={`decision-status ${decision.status}`}>{decision.status === 'accepted' ? 'Acceptée' : decision.status === 'adjusted' ? 'Ajustée' : 'Ignorée'}</span></td><td>{formatCurrency(decision.previousPrice)}</td><td><strong>{formatCurrency(decision.decidedPrice)}</strong></td><td>{decision.note || '—'}</td><td>{new Date(decision.decidedAt).toLocaleString('fr-FR')}</td></tr>)}</tbody></table></div> : <div className="empty-history"><History size={22} /><div><strong>Aucune décision enregistrée</strong><p>Ouvre une recommandation, choisis le prix puis valide ou ignore l’action.</p></div></div>}
    </article>
  </section>
}

function NotificationDrawer({ notifications, read, sending, onSend, onRead, onReadAll, onSettings, onClose }: {
  notifications: ReturnType<typeof notificationsFromRows>
  read: string[]
  sending: boolean
  onSend: (notification: RevNotification) => void
  onRead: (id: string) => void
  onReadAll: () => void
  onSettings: () => void
  onClose: () => void
}) {
  useEscapeToClose(onClose)
  return <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="drawer notification-drawer" data-video="notifications-drawer" role="dialog" aria-modal="true" aria-labelledby="notifications-dialog-title">
    <div className="drawer-head"><div><p className="eyebrow">Centre d’alertes</p><h2 id="notifications-dialog-title">Notifications</h2></div><button onClick={onClose} aria-label="Fermer" autoFocus><X /></button></div>
    <div className="notification-toolbar"><button onClick={onReadAll}><CheckCircle2 size={14} /> Tout marquer comme lu</button><button onClick={onSettings}><Settings2 size={14} /> Préférences</button>{notifications[0] && <button disabled={sending} onClick={() => onSend(notifications[0])}><Mail size={14} /> {sending ? 'Envoi…' : 'Envoyer l’alerte prioritaire'}</button>}</div>
    <div className="notification-list">{notifications.map((item) => <button key={item.id} className={`${item.level} ${read.includes(item.id) ? 'read' : ''}`} onClick={() => onRead(item.id)}><i /><span><small>{formatDate(item.date)}</small><strong>{item.title}</strong><p>{item.message}</p></span></button>)}</div>
    <div className="delivery-explainer"><ShieldCheck size={17} /><p><strong>Protection anti-spam :</strong> doublons supprimés, plages silencieuses respectées et surbooking prioritaire. L’envoi externe nécessite un canal configuré.</p></div>
  </aside></div>
}

function NotificationSettings({ preferences, provider, sending, onTest, onSave, onClose }: {
  preferences: NotificationPreferences
  provider: NotificationProviderStatus | null
  sending: ExternalChannel | 'alert' | null
  onTest: (channel: ExternalChannel, to: string) => void
  onSave: (preferences: NotificationPreferences) => void | Promise<void>
  onClose: () => void
}) {
  useEscapeToClose(onClose)
  const [draft, setDraft] = useState(preferences)
  const toggle = (key: keyof NotificationPreferences) => setDraft((current) => ({ ...current, [key]: !current[key] }))
  return <div className="overlay modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-dialog-title">
    <button className="modal-close" onClick={onClose} aria-label="Fermer" autoFocus><X /></button><p className="eyebrow">Préférences</p><h2 id="settings-dialog-title">Qui reçoit quoi, et comment ?</h2><p className="settings-intro">Les coordonnées sont conservées dans cette démonstration. Les messages externes passent côté serveur par Brevo ; les clés API ne sont jamais envoyées au navigateur.</p>
    <h3>État des connexions réelles</h3><div className="delivery-status-grid">
      {(['email','sms','whatsapp'] as ExternalChannel[]).map((channel) => { const state = provider?.channels[channel]; const target = channel === 'email' ? draft.emailAddress : channel === 'sms' ? draft.phoneNumber : draft.whatsappNumber; return <div key={channel} className={state?.configured ? 'ready' : ''}><span><i /><strong>{channel === 'email' ? 'E-mail' : channel === 'sms' ? 'SMS' : 'WhatsApp'}</strong><small>{state?.detail || 'Serveur indisponible'}</small></span><button disabled={!state?.configured || Boolean(sending)} onClick={() => onTest(channel, target)}>{sending === channel ? 'Envoi…' : 'Tester'}</button></div> })}
    </div>
    <h3>Canaux d’envoi</h3><div className="settings-list">
      <SettingToggle icon={<Bell />} title="Dans RevPilot" description="Toujours visible dans le centre d’alertes." enabled={draft.inApp} onClick={() => toggle('inApp')} />
      <SettingToggle icon={<Mail />} title="E-mail" description="Alertes et résumé à l’équipe de direction." enabled={draft.email} onClick={() => toggle('email')} input={<input value={draft.emailAddress} onChange={(event) => setDraft({ ...draft, emailAddress: event.target.value })} aria-label="Adresse e-mail" />} />
      <SettingToggle icon={<MessageSquare />} title="SMS" description="Réservé aux urgences, notamment le surbooking." enabled={draft.sms} onClick={() => toggle('sms')} input={<input value={draft.phoneNumber} onChange={(event) => setDraft({ ...draft, phoneNumber: event.target.value })} aria-label="Numéro de téléphone" />} />
      <SettingToggle icon={<MessageSquare />} title="WhatsApp" description="Alertes via un modèle WhatsApp Business approuvé." enabled={draft.whatsapp} onClick={() => toggle('whatsapp')} input={<input value={draft.whatsappNumber} onChange={(event) => setDraft({ ...draft, whatsappNumber: event.target.value })} aria-label="Numéro WhatsApp" />} />
      <SettingToggle icon={<Smartphone />} title="Notification navigateur" description="Alerte sur ordinateur ou mobile après autorisation." enabled={draft.browser} onClick={() => toggle('browser')} />
    </div>
    <h3>Types d’alertes</h3><div className="rule-toggles">{([['overbooking','Surbooking'],['priceChanges','Hausse ou baisse de prix'],['cityEvents','Nouvel événement en ville'],['cancellations','Pic d’annulations'],['dailyDigest','Résumé quotidien'],['quietHours','Plage silencieuse 22 h–7 h']] as Array<[keyof NotificationPreferences,string]>).map(([key,label]) => <button key={key} onClick={() => toggle(key)}><span>{label}</span><b className={draft[key] ? 'on' : ''}>{draft[key] ? 'Activé' : 'Désactivé'}</b></button>)}</div>
    <div className="settings-actions"><button className="btn secondary" onClick={onClose}>Annuler</button><button className="btn primary" onClick={() => onSave(draft)}><Check size={16} /> Enregistrer</button></div>
  </section></div>
}

function SettingToggle({ icon, title, description, enabled, onClick, input }: { icon: React.ReactNode; title: string; description: string; enabled: boolean; onClick: () => void; input?: React.ReactNode }) {
  return <div className="setting-row"><span className="setting-icon">{icon}</span><span><strong>{title}</strong><small>{description}</small>{enabled && input}</span><button className={`toggle ${enabled ? 'on' : ''}`} onClick={onClick} aria-label={`${enabled ? 'Désactiver' : 'Activer'} ${title}`}><i /></button></div>
}

function PresentationModal({ onClose, onImport }: { onClose: () => void; onImport: () => void }) {
  useEscapeToClose(onClose)
  const [step, setStep] = useState(0)
  const steps = [
    { icon: Upload, title: '1. L’hôtel importe son export PMS', text: '« Vous gardez votre outil actuel. Vous déposez simplement votre fichier de réservations. »' },
    { icon: Sparkles, title: '2. RevPilot trouve les dates importantes', text: '« Le logiciel compare l’occupation, le rythme des réservations et l’année précédente. »' },
    { icon: ShieldCheck, title: '3. L’hôtelier décide', text: '« Pour chaque date, vous obtenez une action expliquée. Rien n’est appliqué automatiquement. »' },
  ]
  const current = steps[step]
  const Icon = current.icon
  return <div className="overlay modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="presentation-modal" role="dialog" aria-modal="true" aria-labelledby="presentation-dialog-title">
      <button className="modal-close" onClick={onClose} aria-label="Fermer" autoFocus><X /></button>
      <p className="eyebrow">Discours de démonstration</p>
      <h2 id="presentation-dialog-title">Ce que tu présentes à l’hôtel en 30 secondes</h2>
      <div className="presentation-step"><span><Icon size={27} /></span><div><h3>{current.title}</h3><p>{current.text}</p></div></div>
      <div className="step-dots">{steps.map((_, index) => <button key={index} className={index === step ? 'active' : ''} onClick={() => setStep(index)} aria-label={`Étape ${index + 1}`} />)}</div>
      <div className="presentation-actions">
        <button className="btn secondary" onClick={onClose}>Revenir au tableau</button>
        {step < steps.length - 1
          ? <button className="btn primary" onClick={() => setStep(step + 1)}>Étape suivante <ArrowRight size={16} /></button>
          : <button className="btn primary" onClick={onImport}>Tester un fichier <Upload size={16} /></button>}
      </div>
      <div className="pitch-box"><CircleHelp size={16} /><p><strong>La phrase à retenir :</strong> « RevPilot vous indique où regarder chaque matin, pourquoi cette date compte et quelle action envisager. »</p></div>
    </section>
  </div>
}

export default DashboardApp
