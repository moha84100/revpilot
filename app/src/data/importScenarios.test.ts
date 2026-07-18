import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { analyzeData } from '../lib/analysis'
import { parseCsvFile } from '../lib/csv'
import { importScenarios, IMPORT_SCENARIO_REFERENCE_DATE, rowsForScenario } from './importScenarios'

describe('scénarios d’import', () => {
  it('fournit huit scénarios ordonnés et uniques', () => {
    expect(importScenarios).toHaveLength(8)
    expect(new Set(importScenarios.map((scenario) => scenario.id)).size).toBe(8)
    expect(new Set(importScenarios.map((scenario) => scenario.filename)).size).toBe(8)
  })

  for (const scenario of importScenarios) {
    it(`${scenario.title} produit les signaux attendus`, () => {
      const rows = rowsForScenario(scenario.id)
      const counts = analyzeData(rows, IMPORT_SCENARIO_REFERENCE_DATE).reduce<Record<string, number>>((result, item) => {
        result[item.signal] = (result[item.signal] ?? 0) + 1
        return result
      }, {})
      expect(rows).toHaveLength(scenario.horizon === 90 ? 90 : 21)
      for (const [signal, minimum] of Object.entries(scenario.expectedSignals)) {
        expect(counts[signal] ?? 0, `${signal} dans ${scenario.id}`).toBeGreaterThanOrEqual(minimum ?? 0)
      }
    })

    it(`${scenario.filename} passe par le parseur public`, async () => {
      const csv = readFileSync(resolve(process.cwd(), 'public', 'scenarios', scenario.filename), 'utf8')
      const parsed = await parseCsvFile(new File([csv], scenario.filename, { type: 'text/csv' }))
      expect(parsed.rows).toHaveLength(scenario.horizon === 90 ? 90 : 21)
      expect(parsed.sourceName).toBe(scenario.filename)
    })
  }
})
