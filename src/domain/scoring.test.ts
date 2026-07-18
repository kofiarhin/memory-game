import { describe, expect, it } from 'vitest'
import { calculateRoundScore } from './scoring'

describe('calculateRoundScore', () => {
  it('rewards longer sequences progressively', () => {
    expect(calculateRoundScore(3)).toBe(90)
    expect(calculateRoundScore(4)).toBe(160)
    expect(calculateRoundScore(6)).toBe(360)
  })
  it('returns zero for invalid lengths', () => {
    expect(calculateRoundScore(0)).toBe(0)
    expect(calculateRoundScore(Number.NaN)).toBe(0)
  })
})
