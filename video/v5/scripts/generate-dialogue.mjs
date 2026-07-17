import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const edgeTts = `${root}/.video-tools/edge-tts-env/bin/edge-tts`
const ffmpeg = `${root}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const outputDir = `${root}/video/v5/generated/dialogue`
const output = `${outputDir}/dialogue-hoteliers.mp3`

mkdirSync(outputDir, { recursive: true })

const lines = [
  { voice: 'fr-FR-VivienneMultilingualNeural', rate: '+12%', text: 'Tes résultats décrochent encore cette année ?' },
  { voice: 'fr-FR-HenriNeural', rate: '+10%', text: "Oui. J'ajuste mes prix trop tard." },
  { voice: 'fr-FR-VivienneMultilingualNeural', rate: '+12%', text: 'Tu ne connais pas RevPilot ?' }
]

for (const [index, line] of lines.entries()) {
  const target = `${outputDir}/line-${index + 1}.mp3`
  const result = spawnSync(edgeTts, [
    '--voice', line.voice,
    `--rate=${line.rate}`,
    '--text', line.text,
    '--write-media', target
  ], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr.trim() || `Échec de la voix ${index + 1}`)
}

const ffmpegResult = spawnSync(ffmpeg, [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', `${outputDir}/line-1.mp3`,
  '-i', `${outputDir}/line-2.mp3`,
  '-i', `${outputDir}/line-3.mp3`,
  '-filter_complex', '[0:a][1:a][2:a]concat=n=3:v=0:a=1,atempo=1.08,apad=pad_dur=6,atrim=duration=6,afade=t=out:st=5.85:d=0.15[a]',
  '-map', '[a]', '-c:a', 'libmp3lame', '-b:a', '160k', output
], { encoding: 'utf8' })

if (ffmpegResult.status !== 0) throw new Error(ffmpegResult.stderr.trim() || 'Assemblage du dialogue impossible.')
console.log(`Dialogue V5 prêt : ${output}`)
