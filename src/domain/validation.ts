import type { SequenceCard } from './types'

export type ValidationResult = {
  isCorrect: boolean
  positions: boolean[]
}

export function validateSequence(
  expected: readonly SequenceCard[],
  selected: readonly SequenceCard[],
): ValidationResult {
  const positions = expected.map((card, index) => card.cardId === selected[index]?.cardId)
  return {
    positions,
    isCorrect: expected.length === selected.length && positions.every(Boolean),
  }
}
