import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const ffmpeg = `${root}/.video-tools/node_modules/ffmpeg-static/ffmpeg`
const pilot = `${root}/video/v5/generated/pilot-dialogue-hoteliers-sans-audio.mp4`
const dialogue = `${root}/video/v5/generated/dialogue/dialogue-hoteliers.mp3`
const v4 = `${root}/video/output/RevPilot_demo_V4_sans_blancs.mp4`
const outputDir = `${root}/video/output`
const master = `${outputDir}/RevPilot_demo_V5_success_story.mp4`
const share = `${outputDir}/RevPilot_demo_V5_success_story_partage.mp4`
const thumbnail = `${outputDir}/RevPilot_demo_V5_success_story_miniature.png`

mkdirSync(outputDir, { recursive: true })

const run = (args) => {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'warning', '-y', ...args], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}

const font = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
const pilotFilters = [
  'scale=1920:1080:force_original_aspect_ratio=increase',
  'crop=1920:1080',
  'setsar=1',
  'fps=30',
  'trim=duration=6',
  'setpts=PTS-STARTPTS',
  `drawbox=x=48:y=42:w=410:h=56:color=0x101e39@0.86:t=fill:enable='lt(t,5.7)'`,
  `drawtext=fontfile='${font}':text='MISE EN SITUATION FICTIVE':fontcolor=white:fontsize=23:x=72:y=58:enable='lt(t,5.7)'`,
  `drawbox=x=110:y=ih-190:w=iw-220:h=102:color=0x101e39@0.78:t=fill:enable='lt(t,5.7)'`,
  `drawtext=fontfile='${font}':text='— Tes résultats décrochent encore cette année ?':fontcolor=white:fontsize=39:x=(w-text_w)/2:y=h-157:enable='between(t,0,2)'`,
  `drawtext=fontfile='${font}':text='— Oui. J ajuste mes prix trop tard.':fontcolor=white:fontsize=39:x=(w-text_w)/2:y=h-157:enable='between(t,2,3.9)'`,
  `drawtext=fontfile='${font}':text='— Tu ne connais pas RevPilot ?':fontcolor=white:fontsize=39:x=(w-text_w)/2:y=h-157:enable='between(t,3.9,5.7)'`
].join(',')

const filter = [
  `[0:v]${pilotFilters}[pilot]`,
  '[1:v]trim=start=5.7:end=60,setpts=PTS-STARTPTS,scale=1920:1080,setsar=1,fps=30[product]',
  '[pilot][product]xfade=transition=fade:duration=0.3:offset=5.7,format=yuv420p[video]',
  '[2:a]atrim=start=0:end=6,asetpts=PTS-STARTPTS[dialogue]',
  '[1:a]atrim=start=5.85:end=60,asetpts=PTS-STARTPTS[narration]',
  '[dialogue][narration]acrossfade=d=0.15:c1=tri:c2=tri[audio]'
].join(';')

run([
  '-i', pilot,
  '-i', v4,
  '-i', dialogue,
  '-filter_complex', filter,
  '-map', '[video]',
  '-map', '[audio]',
  '-t', '60',
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

run(['-ss', '2.5', '-i', master, '-frames:v', '1', '-vf', 'scale=1280:720', thumbnail])

console.log(`Master V5 prêt : ${master}`)
console.log(`Version légère : ${share}`)
console.log(`Miniature : ${thumbnail}`)
