import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { csvForScenario, importScenarios } from '../src/data/importScenarios.ts'

const output = resolve(import.meta.dirname, '../public/scenarios')
mkdirSync(output, { recursive: true })

for (const scenario of importScenarios) {
  writeFileSync(resolve(output, scenario.filename), csvForScenario(scenario))
}

console.log(`${importScenarios.length} scénarios CSV générés dans app/public/scenarios`)
