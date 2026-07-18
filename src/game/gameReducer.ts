import { calculateRoundScore } from '../domain/scoring'
import { createRecallPool, generateSequence } from '../domain/sequence'
import type { Category, PersistedProfile, SequenceCard } from '../domain/types'
import { validateSequence } from '../domain/validation'

export type GamePhase = 'home' | 'playback' | 'recall' | 'feedback' | 'game-over'

export type GameState = {
  phase: GamePhase
  category: Category
  sequenceLength: number
  sequence: SequenceCard[]
  recallPool: SequenceCard[]
  selection: SequenceCard[]
  score: number
  mistakes: number
  validation: boolean[]
  lastAnswerCorrect: boolean | null
  lastRoundPoints: number
  recallStartedAt: number | null
  lastRecallTimeMs: number | null
  profile: PersistedProfile
}

export type GameAction =
  | { type: 'START'; category: Category }
  | { type: 'PLAYBACK_COMPLETE'; now: number }
  | { type: 'SELECT_CARD'; card: SequenceCard }
  | { type: 'UNDO' }
  | { type: 'SUBMIT'; now: number }
  | { type: 'CONTINUE' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'HOME' }
  | { type: 'SET_SOUND'; enabled: boolean }
  | { type: 'SET_REDUCE_MOTION'; enabled: boolean }
  | { type: 'RESET_PROFILE'; profile: PersistedProfile }

const prepareRound = (category: Category, length: number) => {
  const sequence = generateSequence(category, length)
  return { sequence, recallPool: createRecallPool(sequence) }
}

export const createInitialState = (profile: PersistedProfile): GameState => ({
  phase: 'home',
  category: profile.preferredCategory,
  sequenceLength: 3,
  sequence: [],
  recallPool: [],
  selection: [],
  score: 0,
  mistakes: 0,
  validation: [],
  lastAnswerCorrect: null,
  lastRoundPoints: 0,
  recallStartedAt: null,
  lastRecallTimeMs: null,
  profile,
})

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START': {
      const round = prepareRound(action.category, 3)
      return {
        ...createInitialState({ ...state.profile, preferredCategory: action.category }),
        ...round,
        phase: 'playback',
        category: action.category,
      }
    }
    case 'PLAYBACK_COMPLETE':
      if (state.phase !== 'playback') return state
      return { ...state, phase: 'recall', recallStartedAt: action.now }
    case 'SELECT_CARD':
      if (state.phase !== 'recall' || state.selection.length >= state.sequence.length) return state
      if (state.selection.some((card) => card.instanceId === action.card.instanceId)) return state
      return { ...state, selection: [...state.selection, action.card] }
    case 'UNDO':
      if (state.phase !== 'recall' || state.selection.length === 0) return state
      return { ...state, selection: state.selection.slice(0, -1) }
    case 'SUBMIT': {
      if (state.phase !== 'recall' || state.selection.length !== state.sequence.length) return state
      const result = validateSequence(state.sequence, state.selection)
      const recallTime = state.recallStartedAt ? Math.max(0, action.now - state.recallStartedAt) : null
      const roundPoints = result.isCorrect ? calculateRoundScore(state.sequenceLength) : 0
      const score = state.score + roundPoints
      const mistakes = state.mistakes + (result.isCorrect ? 0 : 1)
      const runCompleted = !result.isCorrect && mistakes >= 2
      const bestRecallTimeMs =
        result.isCorrect && recallTime !== null
          ? state.profile.bestRecallTimeMs === null
            ? recallTime
            : Math.min(state.profile.bestRecallTimeMs, recallTime)
          : state.profile.bestRecallTimeMs

      return {
        ...state,
        phase: 'feedback',
        score,
        mistakes,
        validation: result.positions,
        lastAnswerCorrect: result.isCorrect,
        lastRoundPoints: roundPoints,
        lastRecallTimeMs: recallTime,
        profile: {
          ...state.profile,
          bestScore: Math.max(state.profile.bestScore, score),
          highestSequenceLength: Math.max(state.profile.highestSequenceLength, state.sequenceLength),
          totalRoundsCompleted: state.profile.totalRoundsCompleted + (result.isCorrect ? 1 : 0),
          completedRuns: state.profile.completedRuns + (runCompleted ? 1 : 0),
          bestRecallTimeMs,
        },
      }
    }
    case 'CONTINUE': {
      if (state.phase !== 'feedback') return state
      if (!state.lastAnswerCorrect && state.mistakes >= 2) {
        return { ...state, phase: 'game-over' }
      }
      const nextLength = state.lastAnswerCorrect ? state.sequenceLength + 1 : state.sequenceLength
      const round = prepareRound(state.category, nextLength)
      return {
        ...state,
        ...round,
        phase: 'playback',
        sequenceLength: nextLength,
        selection: [],
        validation: [],
        lastAnswerCorrect: null,
        lastRoundPoints: 0,
        recallStartedAt: null,
      }
    }
    case 'PLAY_AGAIN': {
      const round = prepareRound(state.category, 3)
      return {
        ...createInitialState(state.profile),
        ...round,
        phase: 'playback',
        category: state.category,
      }
    }
    case 'HOME':
      return createInitialState(state.profile)
    case 'SET_SOUND':
      return { ...state, profile: { ...state.profile, soundEnabled: action.enabled } }
    case 'SET_REDUCE_MOTION':
      return { ...state, profile: { ...state.profile, reduceMotion: action.enabled } }
    case 'RESET_PROFILE':
      return createInitialState(action.profile)
    default:
      return state
  }
}
