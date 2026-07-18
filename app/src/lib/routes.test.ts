import { describe, expect, it } from 'vitest'
import { resolveExperience } from './routes'

describe('resolveExperience', () => {
  it('affiche la vitrine sur la racine locale et GitHub Pages', () => {
    expect(resolveExperience('/')).toBe('marketing')
    expect(resolveExperience('/revpilot/')).toBe('marketing')
  })

  it('affiche le produit sur les variantes de /app', () => {
    expect(resolveExperience('/app')).toBe('dashboard')
    expect(resolveExperience('/app/')).toBe('dashboard')
    expect(resolveExperience('/revpilot/app/')).toBe('dashboard')
  })

  it('ignore les mots ressemblants à app', () => {
    expect(resolveExperience('/revpilot/application/')).toBe('marketing')
  })
})
