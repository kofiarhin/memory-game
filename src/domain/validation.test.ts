import { describe, expect, it } from 'vitest'
import type { SequenceCard } from './types'
import { validateSequence } from './validation'

const card = (cardId: string, index: number): SequenceCard => ({ cardId, instanceId: `${cardId}-${index}` })

describe('validateSequence', () => {
  const expected = [card('a', 0), card('b', 1), card('a', 2)]
  it('validates repeated cards by position', () => {
    expect(validateSequence(expected, [card('a', 9), card('b', 8), card('a', 7)])).toEqual({ isCorrect: true, positions: [true, true, true] })
  })
  it('reports every incorrect position', () => {
    expect(validateSequence(expected, [card('b', 9), card('b', 8), card('a', 7)])).toEqual({ isCorrect: false, positions: [false, true, true] })
  })
})
