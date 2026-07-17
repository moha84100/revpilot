import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VideoPresentationBadge } from './VideoPresentationBadge'

describe('badge de présentation vidéo', () => {
  it('indique honnêtement que les données sont démonstratives', () => {
    render(<VideoPresentationBadge />)
    expect(screen.getByText('Données de démonstration').getAttribute('data-video')).toBe('demo-disclaimer')
  })
})
