import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const finishPlayback = async (length = 3) => {
  await act(async () => {
    vi.advanceTimersByTime(length * 1300 + 50)
  })
}

describe('Memory Game', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => { vi.useRealTimers() })

  it('starts with category selection and local records', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /how long a sequence/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /icons/i })).toBeInTheDocument()
    expect(screen.getByText(/best score/i)).toBeInTheDocument()
  })

  it('locks recall controls until playback finishes', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('radio', { name: /shapes/i }))
    fireEvent.click(screen.getByRole('button', { name: /start with shapes/i }))
    expect(screen.getByText(/memorize the sequence/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /submit sequence/i })).not.toBeInTheDocument()
    await finishPlayback()
    expect(screen.getByText(/what did you see/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit sequence/i })).toBeDisabled()
  })

  it('fills slots, supports undo, and enables submission when complete', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /start with colours/i }))
    await finishPlayback()
    const labels = ['Sunset orange', 'Ocean blue', 'Forest green', 'Berry purple', 'Rose pink', 'Lemon yellow', 'Slate grey', 'Aqua teal']
    const availableCards = screen.getAllByRole('button').filter((button) => labels.includes(button.getAttribute('aria-label') ?? ''))
    fireEvent.click(availableCards[0])
    expect(screen.getByRole('button', { name: /undo/i })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
    availableCards.slice(0, 3).forEach((button) => fireEvent.click(button))
    expect(screen.getByRole('button', { name: /submit sequence/i })).toBeEnabled()
  })

  it('clears locally stored progress from settings', () => {
    localStorage.setItem('memory-game-profile', JSON.stringify({
      version: 1,
      bestScore: 900,
      highestSequenceLength: 7,
      preferredCategory: 'icons',
      soundEnabled: false,
      reduceMotion: true,
      completedRuns: 2,
      totalRoundsCompleted: 8,
      bestRecallTimeMs: 1200,
    }))
    render(<App />)
    expect(screen.getByText('900')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /settings/i }))
    fireEvent.click(screen.getByRole('button', { name: /clear local game data/i }))
    expect(screen.queryByText('900')).not.toBeInTheDocument()
  })
})
