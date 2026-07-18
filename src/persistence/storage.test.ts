import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_PROFILE, parseProfile, saveProfile } from './storage'

describe('profile persistence', () => {
  it('falls back safely when stored JSON is malformed', () => {
    expect(parseProfile('{broken')).toEqual(DEFAULT_PROFILE)
  })
  it('resets unsupported schema versions', () => {
    expect(parseProfile(JSON.stringify({ version: 2, bestScore: 900 }))).toEqual(DEFAULT_PROFILE)
  })
  it('ignores storage write failures', () => {
    const storage = { setItem: vi.fn(() => { throw new Error('blocked') }) }
    expect(() => saveProfile(DEFAULT_PROFILE, storage)).not.toThrow()
  })
})
