import { describe, expect, it } from 'vitest'
import { VIDEO_EXPECTED_POTENTIAL, createVideoPresentationScenario, isVideoPresentation } from './videoPresentation'

describe('présentation vidéo V4', () => {
  it('reste inactive sans paramètre', () => {
    expect(isVideoPresentation('')).toBe(false)
    expect(isVideoPresentation('?demoPanel=decision')).toBe(false)
  })

  it('accepte uniquement la version V4', () => {
    expect(isVideoPresentation('?videoPresentation=v4')).toBe(true)
    expect(isVideoPresentation('?videoPresentation=v3')).toBe(false)
  })

  it('reproduit toujours le potentiel commercial validé', () => {
    expect(createVideoPresentationScenario().summary.potentialRevenue).toBe(VIDEO_EXPECTED_POTENTIAL)
  })

  it('retourne un scénario neuf à chaque capture', () => {
    const first = createVideoPresentationScenario()
    const second = createVideoPresentationScenario()
    expect(first.rows).not.toBe(second.rows)
    expect(first.summary).toEqual(second.summary)
  })
})
