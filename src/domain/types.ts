export type Category = 'colours' | 'shapes' | 'icons'

export type CardDefinition = {
  id: string
  category: Category
  label: string
  glyph: string
  colour?: string
  pattern?: string
}

export type SequenceCard = {
  instanceId: string
  cardId: string
}

export type PersistedProfile = {
  version: 1
  bestScore: number
  highestSequenceLength: number
  preferredCategory: Category
  soundEnabled: boolean
  reduceMotion: boolean
  completedRuns: number
  totalRoundsCompleted: number
  bestRecallTimeMs: number | null
}
