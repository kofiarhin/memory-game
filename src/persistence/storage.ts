import type { Category, PersistedProfile } from '../domain/types'

const STORAGE_KEY = 'memory-game-profile'
const categories: Category[] = ['colours', 'shapes', 'icons']

export const DEFAULT_PROFILE: PersistedProfile = {
  version: 1,
  bestScore: 0,
  highestSequenceLength: 0,
  preferredCategory: 'colours',
  soundEnabled: true,
  reduceMotion: false,
  completedRuns: 0,
  totalRoundsCompleted: 0,
  bestRecallTimeMs: null,
}

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

export function parseProfile(value: string | null): PersistedProfile {
  if (!value) return DEFAULT_PROFILE
  try {
    const parsed = JSON.parse(value) as Partial<PersistedProfile>
    if (parsed.version !== 1) return DEFAULT_PROFILE
    return {
      version: 1,
      bestScore: isNonNegativeNumber(parsed.bestScore) ? parsed.bestScore : 0,
      highestSequenceLength: isNonNegativeNumber(parsed.highestSequenceLength) ? parsed.highestSequenceLength : 0,
      preferredCategory: categories.includes(parsed.preferredCategory as Category) ? (parsed.preferredCategory as Category) : 'colours',
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      reduceMotion: typeof parsed.reduceMotion === 'boolean' ? parsed.reduceMotion : false,
      completedRuns: isNonNegativeNumber(parsed.completedRuns) ? parsed.completedRuns : 0,
      totalRoundsCompleted: isNonNegativeNumber(parsed.totalRoundsCompleted) ? parsed.totalRoundsCompleted : 0,
      bestRecallTimeMs:
        parsed.bestRecallTimeMs === null || isNonNegativeNumber(parsed.bestRecallTimeMs)
          ? (parsed.bestRecallTimeMs ?? null)
          : null,
    }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function loadProfile(storage: Pick<Storage, 'getItem'> = window.localStorage): PersistedProfile {
  try {
    return parseProfile(storage.getItem(STORAGE_KEY))
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(
  profile: PersistedProfile,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Persistence is optional. Gameplay continues if storage is unavailable.
  }
}

export function clearProfile(storage: Pick<Storage, 'removeItem'> = window.localStorage): void {
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures and keep the current session usable.
  }
}
