import { describe, expect, it } from 'vitest'
import { exampleCsv, parseCsvFile } from './csv'

describe('import CSV', () => {
  it('accepte les en-têtes français du fichier exemple', async () => {
    const file = new File([exampleCsv], 'exemple.csv', { type: 'text/csv' })
    const parsed = await parseCsvFile(file)
    expect(parsed.rows).toHaveLength(5)
    expect(parsed.rows[0]).toMatchObject({
      date: '2026-07-15',
      roomsAvailable: 48,
      roomsSold: 36,
      pickup7d: 7,
    })
  })

  it('accepte une occupation supérieure à la capacité pour détecter le surbooking', async () => {
    const invalid = 'date,chambres_disponibles,chambres_vendues,chiffre_affaires,reservations_7j,vendues_n_1\n2026-07-15,40,45,4000,3,30'
    const parsed = await parseCsvFile(new File([invalid], 'surbooking.csv'))
    expect(parsed.rows[0].roomsSold).toBe(45)
    expect(parsed.rows[0].roomsAvailable).toBe(40)
  })
})
