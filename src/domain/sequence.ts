import { CARD_SETS } from '../data/cardSets'
import type { Category, SequenceCard } from './types'

export type RandomSource = () => number

export function shuffle<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export function generateSequence(
  category: Category,
  length: number,
  random: RandomSource = Math.random,
): SequenceCard[] {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error('Sequence length must be a positive integer.')
  }

  const deck = CARD_SETS[category]
  const cardIds =
    length <= 5
      ? shuffle(deck, random).slice(0, length).map((card) => card.id)
      : Array.from({ length }, () => deck[Math.floor(random() * deck.length)].id)

  if (length >= 6 && new Set(cardIds).size === cardIds.length) {
    cardIds[cardIds.length - 1] = cardIds[0]
  }

  return cardIds.map((cardId, index) => ({ cardId, instanceId: `${cardId}-${index}` }))
}

export function createRecallPool(
  sequence: readonly SequenceCard[],
  random: RandomSource = Math.random,
): SequenceCard[] {
  return shuffle(sequence, random)
}
