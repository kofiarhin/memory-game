import { describe, expect, it } from 'vitest'
import { createRecallPool, generateSequence } from './sequence'

const seededRandom = (values: number[]) => {
  let index = 0
  return () => values[index++ % values.length]
}

describe('sequence generation', () => {
  it('creates unique cards through sequence length five', () => {
    const sequence = generateSequence('shapes', 5, seededRandom([0.1, 0.8, 0.3, 0.6]))
    expect(new Set(sequence.map((card) => card.cardId))).toHaveLength(5)
  })
  it('allows and guarantees a repeat from length six onward', () => {
    const sequence = generateSequence('icons', 6, seededRandom([0, 0.1, 0.2, 0.3, 0.4, 0.5]))
    expect(new Set(sequence.map((card) => card.cardId)).size).toBeLessThan(sequence.length)
  })
  it('creates a recall pool with the same card instances', () => {
    const sequence = generateSequence('colours', 6, seededRandom([0.1, 0.3, 0.5, 0.7, 0.9]))
    const pool = createRecallPool(sequence, seededRandom([0.9, 0.1, 0.7]))
    expect(pool.map((card) => card.instanceId).sort()).toEqual(sequence.map((card) => card.instanceId).sort())
  })
  it('rejects invalid lengths', () => {
    expect(() => generateSequence('colours', 0)).toThrow(/positive integer/i)
  })
})
