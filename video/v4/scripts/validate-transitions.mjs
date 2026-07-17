import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { transitionQuality } from './quality-utils.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const projectRoot = fileURLToPath(new URL('../../..', import.meta.url))
const ffmpeg = `${projectRoot}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const stateFile = process.env.REVPILOT_STATE_FILE || 'RevPilot_demo_V4_etat.json'
const state = JSON.parse(await readFile(`${projectRoot}/video/output/${stateFile}`, 'utf8'))
const video = `${projectRoot}/video/output/${state.master}`

const silence = spawnSync(ffmpeg, ['-hide_banner', '-i', video, '-af', 'silencedetect=noise=-42dB:d=1', '-vn', '-f', 'null', '-'], { encoding: 'utf8' })
const black = spawnSync(ffmpeg, ['-hide_banner', '-i', video, '-vf', 'blackdetect=d=0.15:pix_th=0.10', '-an', '-f', 'null', '-'], { encoding: 'utf8' })
const quality = transitionQuality(`${silence.stdout}\n${silence.stderr}`, `${black.stdout}\n${black.stderr}`)

if (quality.silences.length || quality.blackFrames.length) {
  if (quality.silences.length) console.error(`Silences trop longs : ${quality.silences.map((duration) => `${duration.toFixed(2)} s`).join(', ')}.`)
  if (quality.blackFrames.length) console.error(`Écrans noirs détectés : ${quality.blackFrames.map((duration) => `${duration.toFixed(2)} s`).join(', ')}.`)
  process.exitCode = 1
} else {
  console.log('Transitions valides : aucun silence ≥ 1 s et aucun écran noir ≥ 0,15 s.')
}
