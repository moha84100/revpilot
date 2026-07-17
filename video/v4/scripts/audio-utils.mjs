import { once } from 'node:events'

export function validateVoiceEnv(env) {
  const missing = ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID'].filter((name) => !env[name]?.trim())
  if (missing.length) throw new Error(`Configuration vocale incomplète : ${missing.join(', ')}.`)
  return { apiKey: env.ELEVENLABS_API_KEY.trim(), voiceId: env.ELEVENLABS_VOICE_ID.trim() }
}

export function sceneFileName(scene, index) {
  const safeId = scene.id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${String(index + 1).padStart(2, '0')}-${safeId}.mp3`
}

export const speechRate = (words, seconds) => seconds > 0 ? Math.round(words / seconds * 60) : 0

export function parseFfmpegDuration(output) {
  const match = String(output).match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/)
  if (!match) throw new Error('Durée audio illisible.')
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
}

export async function audioToBuffer(audio) {
  if (!audio) throw new Error('ElevenLabs a retourné une piste audio vide.')
  if (Buffer.isBuffer(audio)) return audio.length ? audio : Promise.reject(new Error('ElevenLabs a retourné une piste audio vide.'))
  if (audio instanceof Uint8Array || audio instanceof ArrayBuffer) {
    const buffer = Buffer.from(audio instanceof ArrayBuffer ? new Uint8Array(audio) : audio)
    if (!buffer.length) throw new Error('ElevenLabs a retourné une piste audio vide.')
    return buffer
  }
  if (typeof audio.getReader === 'function') {
    const reader = audio.getReader()
    const chunks = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(Buffer.from(value))
    }
    const buffer = Buffer.concat(chunks)
    if (!buffer.length) throw new Error('ElevenLabs a retourné une piste audio vide.')
    return buffer
  }
  if (typeof audio.pipe === 'function') {
    const chunks = []
    audio.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    await once(audio, 'end')
    const buffer = Buffer.concat(chunks)
    if (!buffer.length) throw new Error('ElevenLabs a retourné une piste audio vide.')
    return buffer
  }
  throw new Error('Format audio ElevenLabs non reconnu.')
}
