export const calculateRoundScore = (sequenceLength: number): number => {
  if (!Number.isFinite(sequenceLength) || sequenceLength < 1) return 0
  return Math.round(sequenceLength ** 2 * 10)
}
