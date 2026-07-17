import { spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { parseFfmpegDuration, sceneFileName, speechRate } from './audio-utils.mjs'
import { requiredTempo, tempoFilter } from './local-voice-utils.mjs'
import { wordCount } from './timeline-utils.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const projectRoot = fileURLToPath(new URL('../../..', import.meta.url))
const edgeTts = `${projectRoot}/.video-tools/edge-tts-env/bin/edge-tts`
const ffmpeg = `${projectRoot}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const timeline = JSON.parse(await readFile(`${root}/timeline.json`, 'utf8'))
const audioDir = `${root}/audio`
const tmpDir = `${root}/tmp/local-voice`

await mkdir(audioDir, { recursive: true })
await mkdir(tmpDir, { recursive: true })

function durationOf(path) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-i', path, '-f', 'null', '-'], { encoding: 'utf8' })
  return parseFfmpegDuration(`${result.stdout}\n${result.stderr}`)
}

const durations = []
for (const [index, scene] of timeline.scenes.entries()) {
  const filename = sceneFileName(scene, index)
  const raw = `${tmpDir}/${filename}`
  const output = `${audioDir}/${filename}`
  process.stdout.write(`Vivienne ${index + 1}/${timeline.scenes.length} : ${scene.id}… `)
  const generation = spawnSync(edgeTts, [
    '--voice', 'fr-FR-VivienneMultilingualNeural',
    '--rate=+8%',
    '--pitch=-1Hz',
    '--text', scene.narration,
    '--write-media', raw,
  ], { encoding: 'utf8' })
  if (generation.status !== 0) throw new Error(`La voix Vivienne n’a pas pu être générée pour « ${scene.id} » : ${generation.stderr.trim() || 'service vocal indisponible'}`)

  const rawDuration = durationOf(raw)
  const target = scene.duration - 0.45
  const tempo = requiredTempo(rawDuration, target)
  if (tempo > 1.22) throw new Error(`La narration « ${scene.id} » est trop longue pour rester naturelle.`)
  const conversion = spawnSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', raw,
    '-af', tempoFilter(tempo), '-c:a', 'libmp3lame', '-b:a', '128k', output,
  ], { encoding: 'utf8' })
  if (conversion.status !== 0) throw new Error(`Le recalage de la scène « ${scene.id} » a échoué.`)
  const duration = durationOf(output)
  durations.push({
    id: scene.id,
    file: filename,
    provider: 'edge-tts',
    voice: 'fr-FR-VivienneMultilingualNeural',
    rate: '+8%',
    duration,
    words: wordCount(scene.narration),
    wordsPerMinute: speechRate(wordCount(scene.narration), duration),
    tempoApplied: tempo,
  })
  console.log(`${duration.toFixed(2)} s · ${speechRate(wordCount(scene.narration), duration)} mots/min`)
}

await writeFile(`${audioDir}/durations.json`, `${JSON.stringify(durations, null, 2)}\n`)
console.log('Les sept pistes Vivienne sont prêtes.')
