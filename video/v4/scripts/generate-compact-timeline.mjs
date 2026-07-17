import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { compactTimeline } from './compact-timeline-utils.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const timeline = JSON.parse(await readFile(`${root}/timeline.json`, 'utf8'))
const durations = JSON.parse(await readFile(`${root}/audio/durations.json`, 'utf8'))
const compact = compactTimeline(timeline, durations)
await writeFile(`${root}/timeline-compact.json`, `${JSON.stringify(compact, null, 2)}\n`)
console.log(`Timeline compacte prête : ${compact.scenes.reduce((sum, scene) => sum + scene.duration, 0).toFixed(2)} s.`)
