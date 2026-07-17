import { spawnSync } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { escapeFilterPath, zoomFilter } from './compositor-utils.mjs'
import { sceneFileName } from './audio-utils.mjs'

const v4Root = fileURLToPath(new URL('..', import.meta.url))
const projectRoot = fileURLToPath(new URL('../../..', import.meta.url))
const videoRoot = `${projectRoot}/video`
const outputDir = `${videoRoot}/output`
const renderDir = `${v4Root}/renders`
const tmpDir = `${v4Root}/tmp/composed`
const ffmpeg = `${projectRoot}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const node = `${projectRoot}/.tools/node/bin/node`
const timeline = JSON.parse(await readFile(`${v4Root}/timeline.json`, 'utf8'))
const metadata = JSON.parse(await readFile(`${v4Root}/captures/ui-flow-metadata.json`, 'utf8'))
const metadataById = Object.fromEntries(metadata.scenes.map((scene) => [scene.id, scene]))

await mkdir(outputDir, { recursive: true })
await mkdir(tmpDir, { recursive: true })
const assets = spawnSync(node, [`${v4Root}/scripts/render-assets.mjs`], { stdio: 'inherit' })
if (assets.status !== 0) process.exit(assets.status ?? 1)

const hasFile = async (path) => access(path, constants.R_OK).then(() => true, () => false)
const audioFiles = timeline.scenes.map((scene, index) => `${v4Root}/audio/${sceneFileName(scene, index)}`)
const voiced = (await Promise.all(audioFiles.map(hasFile))).every(Boolean)
const clips = []
const font = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

function runFfmpeg(args, label) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'warning', '-y', ...args], { stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`FFmpeg a échoué pendant ${label}.`)
}

for (const [index, scene] of timeline.scenes.entries()) {
  const clip = `${tmpDir}/${String(index + 1).padStart(2, '0')}-${scene.id}.mp4`
  clips.push(clip)
  const args = []
  let baseFilter
  if (scene.source === 'hotel-broll') {
    args.push('-ss', '0', '-t', String(scene.duration), '-i', `${videoRoot}/ai-clips/hotel-intro.mp4`)
    baseFilter = 'fps=30,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080'
  } else if (scene.source === 'cta') {
    args.push('-loop', '1', '-t', String(scene.duration), '-i', `${renderDir}/cta.png`)
    baseFilter = 'fps=30,scale=1920:1080'
  } else {
    const meta = metadataById[scene.id]
    if (!meta) throw new Error(`Métadonnées de capture absentes pour ${scene.id}.`)
    args.push('-ss', String(meta.leadIn), '-t', String(scene.duration), '-i', `${v4Root}/captures/${meta.file}`)
    baseFilter = zoomFilter(scene, meta.boxes)
  }

  const cutawayInput = scene.cutaway ? args.filter((value) => value === '-i').length : null
  if (scene.cutaway) {
    args.push('-ss', '0', '-t', String(scene.cutaway.duration), '-i', `${videoRoot}/ai-clips/${scene.cutaway.file}`)
  }
  const characterInput = scene.character ? args.filter((value) => value === '-i').length : null
  if (scene.character) args.push('-loop', '1', '-t', String(scene.duration), '-i', `${renderDir}/character-${scene.character.pose}.png`)
  const audioInput = args.filter((value) => value === '-i').length
  if (voiced) args.push('-i', audioFiles[index])
  else args.push('-f', 'lavfi', '-t', String(scene.duration), '-i', 'anullsrc=r=48000:cl=stereo')

  const filters = [`[0:v]${baseFilter},setpts=PTS-STARTPTS[base]`]
  let videoLabel = 'base'
  if (scene.cutaway) {
    const duration = scene.cutaway.duration
    const fade = scene.cutaway.fade
    filters.push(`[${cutawayInput}:v]fps=30,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,trim=duration=${duration},setpts=PTS-STARTPTS,format=yuva420p,fade=t=out:st=${duration - fade}:d=${fade}:alpha=1[cutaway]`)
    filters.push(`[${videoLabel}][cutaway]overlay=0:0:enable='lt(t,${duration})'[withcutaway]`)
    videoLabel = 'withcutaway'
  }
  if (scene.character) {
    const start = scene.character.start
    const end = start + scene.character.duration
    filters.push(`[${characterInput}:v]scale=230:-1,format=rgba,setpts=PTS-STARTPTS[char]`)
    filters.push(`[${videoLabel}][char]overlay=x=270:y=H-h-35:enable='between(t,${start},${end})'[withchar]`)
    videoLabel = 'withchar'
  }
  if (scene.source !== 'cta') {
    const subtitlePath = `${tmpDir}/${scene.id}-subtitle.txt`
    await writeFile(subtitlePath, `${scene.subtitle}\n`)
    filters.push(`[${videoLabel}]drawtext=textfile='${escapeFilterPath(subtitlePath)}':fontfile='${escapeFilterPath(font)}':fontsize=46:fontcolor=white:x=(w-text_w)/2:y=h-105:box=1:boxcolor=0x13213ddd:boxborderw=18:enable='between(t,0.6,${Math.max(.7, scene.duration - .45)})'[v]`)
  } else {
    filters.push(`[${videoLabel}]null[v]`)
  }
  filters.push(`[${audioInput}:a]apad=pad_dur=${scene.duration},atrim=0:${scene.duration},asetpts=PTS-STARTPTS[a]`)

  args.push(
    '-filter_complex', filters.join(';'), '-map', '[v]', '-map', '[a]',
    '-t', String(scene.duration), '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', clip,
  )
  runFfmpeg(args, `le rendu de ${scene.id}`)
}

const concatPath = `${tmpDir}/clips.txt`
await writeFile(concatPath, clips.map((clip) => `file '${clip.replaceAll("'", "'\\''")}'`).join('\n') + '\n')
const masterName = voiced ? 'RevPilot_demo_V4_dynamique.mp4' : 'RevPilot_demo_V4_visuel_sans_voix.mp4'
const master = `${outputDir}/${masterName}`
runFfmpeg(['-f', 'concat', '-safe', '0', '-i', concatPath, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', master], 'l’assemblage final')

if (voiced) {
  runFfmpeg(['-i', master, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', `${outputDir}/RevPilot_demo_V4_partage.mp4`], 'la version de partage')
}
runFfmpeg(['-ss', '8', '-i', master, '-frames:v', '1', '-update', '1', '-vf', 'scale=1280:720', `${outputDir}/RevPilot_demo_V4_miniature.png`], 'la miniature')
await writeFile(`${outputDir}/RevPilot_demo_V4_etat.json`, `${JSON.stringify({
  voiced,
  master: masterName,
  duration: timeline.scenes.reduce((sum, scene) => sum + scene.duration, 0),
  contextVideos: timeline.scenes.filter((scene) => scene.source === 'hotel-broll' || scene.cutaway).map((scene) => scene.cutaway?.file ?? 'hotel-intro.mp4'),
}, null, 2)}\n`)
console.log(voiced ? `Vidéo V4 finale prête : ${master}` : `Pré-montage visuel prêt : ${master}. Ajoutez la voix ElevenLabs pour produire le master final.`)
