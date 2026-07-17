import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const edgeTts = `${root}/.video-tools/edge-tts-env/bin/edge-tts`
const ffmpeg = `${root}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const outputDir = `${root}/video/v6/generated/audio`
const raw = `${outputDir}/intro-vivienne-brut.mp3`
const output = `${outputDir}/intro-vivienne-corrige.mp3`
const targetDuration = 14.6
const text = 'Je fixais mes tarifs au feeling, et je repérais toujours trop tard les dates qui se vendaient vite. Avec Rève Païlote, je vois où agir, je comprends pourquoi, et je garde la décision finale.'

mkdirSync(outputDir, { recursive: true })

const generation = spawnSync(edgeTts, [
  '--voice', 'fr-FR-VivienneMultilingualNeural',
  '--rate=+6%',
  '--pitch=-1Hz',
  '--text', text,
  '--write-media', raw
], { encoding: 'utf8' })

if (generation.status !== 0) throw new Error(generation.stderr.trim() || 'La nouvelle voix n’a pas pu être générée.')

const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', raw, '-f', 'null', '-'], { encoding: 'utf8' })
const durationMatch = `${probe.stdout}\n${probe.stderr}`.match(/Duration: (\d+):(\d+):([\d.]+)/)
if (!durationMatch) throw new Error('Durée de la nouvelle voix introuvable.')
const rawDuration = Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3])
const tempo = rawDuration / targetDuration

const conversion = spawnSync(ffmpeg, [
  '-hide_banner', '-loglevel', 'error', '-y', '-i', raw,
  '-af', `atempo=${tempo.toFixed(6)},apad=pad_dur=15,atrim=duration=15`,
  '-c:a', 'libmp3lame', '-b:a', '160k', output
], { encoding: 'utf8' })

if (conversion.status !== 0) throw new Error(conversion.stderr.trim() || 'Le recalage de la voix a échoué.')
console.log(`Voix corrigée prête : ${output}`)
