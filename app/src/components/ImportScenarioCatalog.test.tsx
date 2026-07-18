import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImportScenarioCatalog } from './ImportScenarioCatalog'

afterEach(cleanup)

describe('catalogue des scénarios', () => {
  it('affiche huit chargements et huit téléchargements accessibles', () => {
    render(<ImportScenarioCatalog loadingId={null} activeId={null} onLoad={() => undefined} />)
    expect(screen.getAllByRole('button', { name: /charger le scénario/i })).toHaveLength(8)
    expect(screen.getAllByRole('link', { name: /télécharger le csv/i })).toHaveLength(8)
  })

  it('transmet le scénario sélectionné', () => {
    const onLoad = vi.fn()
    render(<ImportScenarioCatalog loadingId={null} activeId={null} onLoad={onLoad} />)
    fireEvent.click(screen.getByRole('button', { name: /charger le scénario surbooking/i }))
    expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ id: 'overbooking' }))
  })
})
