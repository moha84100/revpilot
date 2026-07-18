import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MarketingHome from './MarketingHome'

describe('MarketingHome', () => {
  it('présente une promesse claire et un accès au produit', () => {
    render(<MarketingHome />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Voir plus tôt')
    expect(screen.getAllByRole('link', { name: /accéder à revpilot/i })[0].getAttribute('href')).toBe('./app/')
  })

  it('reste transparent sur le caractère consultatif du produit', () => {
    render(<MarketingHome />)

    expect(screen.getAllByText(/aucun prix n’est modifié automatiquement/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/données d’exemple/i).length).toBeGreaterThan(0)
    expect(document.body.textContent).not.toMatch(/explorer la démo|lancer la démo|prototype/i)
  })
})
