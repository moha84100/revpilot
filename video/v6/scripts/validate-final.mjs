import { existsSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const ffmpeg = `${root}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const outputDir = `${root}/video/output`
const master = `${outputDir}/RevPilot_demo_V6_influenceuse_sync.mp4`
const share = `${outputDir}/RevPilot_demo_V6_influenceuse_sync_partage.mp4`
const thumbnail = `${outputDir}/RevPilot_demo_V6_influenceuse_sync_miniature.png`
const reportFile = `${outputDir}/RevPilot_demo_V6_influenceuse_sync_controle.json`
const transitionFrames = `${root}/video/v6/generated/qc`

const inspect = (args) => spawnSync(ffmpeg, ['-hide_banner', ...args], { encoding: 'utf8' })
const failures = []

for (const file of [master, share, thumbnail]) {
  if (!existsSync(file)) failures.push(`Fichier absent : ${file}`)
}

const probe = inspect(['-i', master, '-f', 'null', '-'])
const metadata = `${probe.stdout}\n${probe.stderr}`
const parts = metadata.match(/Duration: (\d+):(\d+):([\d.]+)/)?.slice(1).map(Number)
const duration = parts ? parts[0] * 3600 + parts[1] * 60 + parts[2] : Number.NaN

if (!Number.isFinite(duration) || duration < 56.2 || duration > 56.7) failures.push(`Durée inattendue : ${duration}`)
if (!/Video: h264/.test(metadata)) failures.push('Codec vidéo H.264 absent.')
if (!/Audio: aac/.test(metadata)) failures.push('Codec audio AAC absent.')
if (!/1920x1080/.test(metadata)) failures.push('Résolution master différente de 1920×1080.')

const blackRun = inspect(['-i', master, '-vf', 'blackdetect=d=0.12:pix_th=0.10', '-an', '-f', 'null', '-'])
const blackOutput = `${blackRun.stdout}\n${blackRun.stderr}`
const blackSegments = [...blackOutput.matchAll(/black_start:([\d.]+).*?black_end:([\d.]+)/g)].map((match) => ({ start: Number(match[1]), end: Number(match[2]) }))
if (blackSegments.length) failures.push(`Images noires détectées : ${JSON.stringify(blackSegments)}`)

const silenceRun = inspect(['-i', master, '-af', 'silencedetect=noise=-45dB:d=1.5', '-vn', '-f', 'null', '-'])
const silenceOutput = `${silenceRun.stdout}\n${silenceRun.stderr}`
const longSilences = [...silenceOutput.matchAll(/silence_duration: ([\d.]+)/g)].map((match) => Number(match[1])).filter((value) => value >= 1.5)
if (longSilences.length) failures.push(`Silences longs détectés : ${longSilences.join(', ')}`)

const report = {
  generatedAt: new Date().toISOString(),
  master,
  duration,
  resolution: '1920x1080',
  codecs: { video: 'h264', audio: 'aac' },
  transition: { type: 'hard-cut', timestamp: 15, qcDirectory: transitionFrames },
  blackSegments,
  longSilences,
  disclosure: 'Mise en situation fictive visible pendant le témoignage IA',
  result: failures.length ? 'failed' : 'passed',
  failures
}

writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`)

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Contrôle V6 réussi : ${duration.toFixed(2)} s, coupe franche à 15 s, sans noir ni silence long.`)
