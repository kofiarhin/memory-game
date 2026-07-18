import { describe, expect, it } from 'vitest'
import type { SequenceCard } from '../domain/types'
import { DEFAULT_PROFILE } from '../persistence/storage'
import { createInitialState, gameReducer, type GameState } from './gameReducer'

const cards: SequenceCard[] = [
  { cardId: 'circle', instanceId: 'circle-0' },
  { cardId: 'triangle', instanceId: 'triangle-1' },
  { cardId: 'square', instanceId: 'square-2' },
]

const recallState = (selection: SequenceCard[], mistakes = 0): GameState => ({
  ...createInitialState(DEFAULT_PROFILE),
  phase: 'recall',
  category: 'shapes',
  sequence: cards,
  recallPool: cards,
  selection,
  recallStartedAt: 100,
  mistakes,
})

describe('gameReducer', () => {
  it('awards points and increases length after a correct round', () => {
    const feedback = gameReducer(recallState(cards), { type: 'SUBMIT', now: 1100 })
    expect(feedback.lastAnswerCorrect).toBe(true)
    expect(feedback.score).toBe(90)
    const next = gameReducer(feedback, { type: 'CONTINUE' })
    expect(next.phase).toBe('playback')
    expect(next.sequenceLength).toBe(4)
  })
  it('uses the retry on the first incorrect answer without increasing length', () => {
    const wrong = [cards[1], cards[0], cards[2]]
    const feedback = gameReducer(recallState(wrong), { type: 'SUBMIT', now: 500 })
    expect(feedback.mistakes).toBe(1)
    const retry = gameReducer(feedback, { type: 'CONTINUE' })
    expect(retry.phase).toBe('playback')
    expect(retry.sequenceLength).toBe(3)
  })
  it('ends the run after a second incorrect answer', () => {
    const wrong = [cards[1], cards[0], cards[2]]
    const feedback = gameReducer(recallState(wrong, 1), { type: 'SUBMIT', now: 500 })
    const gameOver = gameReducer(feedback, { type: 'CONTINUE' })
    expect(feedback.mistakes).toBe(2)
    expect(gameOver.phase).toBe('game-over')
    expect(gameOver.profile.completedRuns).toBe(1)
  })
  it('ignores selections outside the recall phase', () => {
    const state = createInitialState(DEFAULT_PROFILE)
    expect(gameReducer(state, { type: 'SELECT_CARD', card: cards[0] })).toBe(state)
  })
})
