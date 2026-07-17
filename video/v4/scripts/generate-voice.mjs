import { spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { audioToBuffer, parseFfmpegDuration, sceneFileName, speechRate, validateVoiceEnv } from './audio-utils.mjs'
import { wordCount } from './timeline-utils.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
dotenv.config({ path: `${root}/.env.local`, quiet: true })
const { apiKey, voiceId } = validateVoiceEnv(process.env)
const timeline = JSON.parse(await readFile(`${root}/timeline.json`, 'utf8'))
const audioDir = `${root}/audio`
const ffmpeg = fileURLToPath(new URL('../../../.video-tools/node_modules/ffmpeg-static/ffmpeg', import.meta.url))
const client = new ElevenLabsClient({ apiKey })

const voiceSettings = {
  stability: 0.42,
  similarityBoost: 0.78,
  style: 0.22,
  useSpeakerBoost: true,
  speed: 1.08,
}

await mkdir(audioDir, { recursive: true })
const durations = []

for (const [index, scene] of timeline.scenes.entries()) {
  const filename = sceneFileName(scene, index)
  const output = `${audioDir}/${filename}`
  process.stdout.write(`Voix ${index + 1}/${timeline.scenes.length} : ${scene.id}… `)
  try {
    const audio = await client.textToSpeech.convert(voiceId, {
      text: scene.narration,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
      voiceSettings,
      seed: 84100 + index,
    })
    const buffer = await audioToBuffer(audio)
    await writeFile(output, buffer)
    const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', output, '-f', 'null', '-'], { encoding: 'utf8' })
    const duration = parseFfmpegDuration(`${probe.stdout}\n${probe.stderr}`)
    durations.push({ id: scene.id, file: filename, duration, words: wordCount(scene.narration), wordsPerMinute: speechRate(wordCount(scene.narration), duration) })
    console.log(`${duration.toFixed(2)} s`)
  } catch {
    throw new Error(`La génération ElevenLabs a échoué pour la scène « ${scene.id} ». Vérifiez le compte, la voix et les droits de la clé.`)
  }
}

await writeFile(`${audioDir}/durations.json`, `${JSON.stringify(durations, null, 2)}\n`)
console.log('Voix V4 générée. Aucun fallback de synthèse système n’a été utilisé.')
