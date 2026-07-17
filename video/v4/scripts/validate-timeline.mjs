import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { validateTimeline } from './timeline-utils.mjs'

const timelinePath = fileURLToPath(new URL('../timeline.json', import.meta.url))
const timeline = JSON.parse(await readFile(timelinePath, 'utf8'))
const result = validateTimeline(timeline)
if (result.errors.length) {
  for (const error of result.errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Timeline valide : ${result.totalDuration} s, ${result.totalWords} mots, ${timeline.scenes.length} scènes.`)
}
