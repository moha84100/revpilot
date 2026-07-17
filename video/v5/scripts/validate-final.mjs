import { existsSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const ffmpeg = `${root}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const master = `${root}/video/output/RevPilot_demo_V5_success_story.mp4`
const share = `${root}/video/output/RevPilot_demo_V5_success_story_partage.mp4`
const thumbnail = `${root}/video/output/RevPilot_demo_V5_success_story_miniature.png`
const reportFile = `${root}/video/output/RevPilot_demo_V5_success_story_controle.json`

const inspect = (args) => spawnSync(ffmpeg, ['-hide_banner', ...args], { encoding: 'utf8' })
const failures = []

for (const file of [master, share, thumbnail]) {
  if (!existsSync(file)) failures.push(`Fichier absent : ${file}`)
}

const probe = inspect(['-i', master, '-f', 'null', '-'])
const metadata = `${probe.stdout}\n${probe.stderr}`
const duration = Number(metadata.match(/Duration: (\d+):(\d+):([\d.]+)/)?.slice(1).reduce((seconds, value, index) => seconds + Number(value) * [3600, 60, 1][index], 0))

if (!Number.isFinite(duration) || duration < 59.8 || duration > 60.2) failures.push(`Durée inattendue : ${duration}`)
if (!/Video: h264/.test(metadata)) failures.push('Codec vidéo H.264 absent.')
if (!/Audio: aac/.test(metadata)) failures.push('Codec audio AAC absent.')
if (!/1920x1080/.test(metadata)) failures.push('Résolution master différente de 1920×1080.')

const blackRun = inspect(['-i', master, '-vf', 'blackdetect=d=0.15:pix_th=0.10', '-an', '-f', 'null', '-'])
const blackOutput = `${blackRun.stdout}\n${blackRun.stderr}`
const blackSegments = [...blackOutput.matchAll(/black_start:([\d.]+).*?black_end:([\d.]+)/g)].map((match) => ({ start: Number(match[1]), end: Number(match[2]) }))
if (blackSegments.length) failures.push(`Images noires détectées : ${JSON.stringify(blackSegments)}`)

const silenceRun = inspect(['-i', master, '-af', 'silencedetect=noise=-42dB:d=1', '-vn', '-f', 'null', '-'])
const silenceOutput = `${silenceRun.stdout}\n${silenceRun.stderr}`
const longSilences = [...silenceOutput.matchAll(/silence_duration: ([\d.]+)/g)].map((match) => Number(match[1])).filter((value) => value >= 1)
if (longSilences.length) failures.push(`Silences longs détectés : ${longSilences.join(', ')}`)

const report = {
  generatedAt: new Date().toISOString(),
  master,
  duration,
  resolution: '1920x1080',
  codecs: { video: 'h264', audio: 'aac' },
  blackSegments,
  longSilences,
  disclosure: 'Mise en situation fictive visible sur le plan Higgsfield',
  result: failures.length ? 'failed' : 'passed',
  failures
}

writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`)

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Contrôle V5 réussi : ${duration.toFixed(2)} s, 1920×1080, H.264/AAC, sans noir ni silence long.`)
