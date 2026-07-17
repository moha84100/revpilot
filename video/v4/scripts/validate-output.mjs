import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const projectRoot = fileURLToPath(new URL('../../..', import.meta.url))
const ffmpeg = `${projectRoot}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const stateFile = process.env.REVPILOT_STATE_FILE || 'RevPilot_demo_V4_etat.json'
const state = JSON.parse(await readFile(`${projectRoot}/video/output/${stateFile}`, 'utf8'))
const output = `${projectRoot}/video/output/${state.master}`
const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', output], { encoding: 'utf8' })
const info = `${probe.stdout}\n${probe.stderr}`
const durationMatch = info.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/)
const duration = durationMatch ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]) : 0
const errors = []
if (!/1920x1080/.test(info)) errors.push('Le master n’est pas en 1920×1080.')
const durationRange = state.durationRange || [60, 75]
if (duration < durationRange[0] || duration > durationRange[1]) errors.push(`Durée incorrecte : ${duration.toFixed(2)} s.`)
if (!/Video: h264/.test(info)) errors.push('Le codec vidéo final n’est pas H.264.')
if (!/Audio: aac/.test(info)) errors.push('La piste audio AAC est absente.')
if (errors.length) {
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Sortie valide : ${state.master}, ${duration.toFixed(2)} s, 1920×1080, H.264/AAC${state.voiced ? ', voix finale' : ', piste témoin silencieuse'}.`)
}
