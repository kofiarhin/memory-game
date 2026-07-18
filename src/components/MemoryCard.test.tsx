import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryCard } from './MemoryCard'

const card = { cardId: 'circle', instanceId: 'circle-0' }

describe('MemoryCard', () => {
  it('includes correct status in the accessible name', () => {
    render(<MemoryCard card={card} category="shapes" status="correct" />)

    expect(screen.getByRole('img', { name: 'Circle, correct' })).toBeInTheDocument()
  })

  it('includes incorrect status in the accessible name', () => {
    render(<MemoryCard card={card} category="shapes" status="incorrect" />)

    expect(screen.getByRole('img', { name: 'Circle, incorrect' })).toBeInTheDocument()
  })
})
