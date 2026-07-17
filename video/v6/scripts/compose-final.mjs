import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const ffmpeg = `${root}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const influencer = `${root}/video/v6/generated/influenceuse-margot.mp4`
const influencerVoice = `${root}/video/v6/generated/audio/intro-vivienne-corrige.mp3`
const segments = [
  { video: `${root}/video/v4/captures/potential.webm`, audio: `${root}/video/v4/audio/02-potential.mp3`, duration: 7.85, start: 3.21, focus: [1635, 245] },
  { video: `${root}/video/v4/captures/recommendation.webm`, audio: `${root}/video/v4/audio/03-recommendation.mp3`, duration: 9.05, start: 3.38, focus: [1680, 540] },
  { video: `${root}/video/v4/captures/human-decision.webm`, audio: `${root}/video/v4/audio/04-human-decision.mp3`, duration: 9.17, start: 3.39, focus: [1780, 950] },
  { video: `${root}/video/v4/captures/events.webm`, audio: `${root}/video/v4/audio/05-events.mp3`, duration: 8.74, start: 3.42, focus: [715, 540] },
  { video: `${root}/video/v4/renders/cta.png`, audio: `${root}/video/v4/audio/07-cta.mp3`, duration: 6.62, still: true }
]
const outputDir = `${root}/video/output`
const master = `${outputDir}/RevPilot_demo_V6_influenceuse_sync.mp4`
const share = `${outputDir}/RevPilot_demo_V6_influenceuse_sync_partage.mp4`
const thumbnail = `${outputDir}/RevPilot_demo_V6_influenceuse_sync_miniature.png`

mkdirSync(outputDir, { recursive: true })

const run = (args) => {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'warning', '-y', ...args], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}

const font = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
const filters = [
  `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30,trim=duration=15,setpts=PTS-STARTPTS,drawbox=x=48:y=42:w=410:h=56:color=0x101e39@0.86:t=fill,drawtext=fontfile='${font}':text='MISE EN SITUATION FICTIVE':fontcolor=white:fontsize=23:x=72:y=58,format=yuv420p[v0]`,
  '[1:a]atrim=duration=15,asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[a0]',
  ...segments.flatMap((segment, index) => {
    const videoInput = 2 + index * 2
    const audioInput = videoInput + 1
    const videoPrefix = segment.still ? 'loop=loop=-1:size=1:start=0,' : ''
    const trim = segment.start ? `trim=start=${segment.start}:duration=${segment.duration}` : `trim=duration=${segment.duration}`
    const zoom = segment.focus
      ? `,zoompan=z='if(lte(on,24),1,min(zoom+0.00065,1.12))':x='max(0,min(iw-iw/zoom,${segment.focus[0]}-iw/zoom/2))':y='max(0,min(ih-ih/zoom,${segment.focus[1]}-ih/zoom/2))':d=1:s=1920x1080:fps=30`
      : ''
    return [
      `[${videoInput}:v]${videoPrefix}${trim},setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30${zoom},format=yuv420p[v${index + 1}]`,
      `[${audioInput}:a]atrim=duration=${segment.duration},asetpts=PTS-STARTPTS,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[a${index + 1}]`
    ]
  }),
  `${[0, 1, 2, 3, 4, 5].map((index) => `[v${index}][a${index}]`).join('')}concat=n=6:v=1:a=1[video][audio]`
].join(';')

run([
  '-i', influencer,
  '-i', influencerVoice,
  ...segments.flatMap((segment) => ['-i', segment.video, '-i', segment.audio]),
  '-filter_complex', filters,
  '-map', '[video]',
  '-map', '[audio]',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '18',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-movflags', '+faststart',
  master
])

run([
  '-i', master,
  '-vf', 'scale=1280:720',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '25',
  '-c:a', 'aac',
  '-b:a', '128k',
  '-movflags', '+faststart',
  share
])

run(['-ss', '5', '-i', master, '-frames:v', '1', '-update', '1', '-vf', 'scale=1280:720', thumbnail])

console.log(`Master V6 prêt : ${master}`)
console.log(`Version légère : ${share}`)
console.log(`Miniature : ${thumbnail}`)
