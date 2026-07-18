import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { MemoryCard } from './components/MemoryCard'
import { StatPill } from './components/StatPill'
import { CARD_SETS } from './data/cardSets'
import type { Category } from './domain/types'
import { createInitialState, gameReducer } from './game/gameReducer'
import { clearProfile, DEFAULT_PROFILE, loadProfile, saveProfile } from './persistence/storage'

const categoryCopy: Record<Category, { title: string; description: string; glyph: string }> = {
  colours: { title: 'Colours', description: 'Bold colours with symbols and labels.', glyph: '🎨' },
  shapes: { title: 'Shapes', description: 'Clean geometric forms and symbols.', glyph: '◆' },
  icons: { title: 'Icons', description: 'Familiar objects from everyday life.', glyph: '🚀' },
}

function playTone(success: boolean) {
  const AudioContextClass = window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.value = success ? 660 : 210
  oscillator.type = success ? 'sine' : 'triangle'
  gain.gain.setValueAtTime(0.08, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.18)
  oscillator.addEventListener('ended', () => void context.close())
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState(loadProfile()))
  const [selectedCategory, setSelectedCategory] = useState<Category>(state.profile.preferredCategory)
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [cardVisible, setCardVisible] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const resultTonePlayed = useRef(false)

  const activePlaybackCard = state.sequence[playbackIndex]
  const selectedIds = useMemo(() => new Set(state.selection.map((card) => card.instanceId)), [state.selection])

  useEffect(() => { saveProfile(state.profile) }, [state.profile])

  useEffect(() => {
    if (state.phase !== 'playback' || state.sequence.length === 0) return
    setPlaybackIndex(0)
    setCardVisible(true)
    let cardTimer: number | undefined
    let gapTimer: number | undefined
    let index = 0
    let cancelled = false

    const showNext = () => {
      if (cancelled) return
      setPlaybackIndex(index)
      setCardVisible(true)
      cardTimer = window.setTimeout(() => {
        setCardVisible(false)
        gapTimer = window.setTimeout(() => {
          index += 1
          if (index < state.sequence.length) showNext()
          else dispatch({ type: 'PLAYBACK_COMPLETE', now: Date.now() })
        }, 300)
      }, 1000)
    }

    showNext()
    return () => {
      cancelled = true
      if (cardTimer) window.clearTimeout(cardTimer)
      if (gapTimer) window.clearTimeout(gapTimer)
    }
  }, [state.phase, state.sequence])

  useEffect(() => {
    if (state.phase !== 'feedback') {
      resultTonePlayed.current = false
      return
    }
    if (state.profile.soundEnabled && state.lastAnswerCorrect !== null && !resultTonePlayed.current) {
      resultTonePlayed.current = true
      playTone(state.lastAnswerCorrect)
    }
  }, [state.lastAnswerCorrect, state.phase, state.profile.soundEnabled])

  const startGame = () => dispatch({ type: 'START', category: selectedCategory })
  const resetData = () => {
    clearProfile()
    setSelectedCategory('colours')
    dispatch({ type: 'RESET_PROFILE', profile: DEFAULT_PROFILE })
  }
  const retryText = state.mistakes === 0 ? '1 retry' : 'Retry used'

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#1e3a8a33,transparent_38%),radial-gradient(circle_at_bottom_right,#7c3aed22,transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => dispatch({ type: 'HOME' })} className="flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300" aria-label="Return to home">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-xl shadow-lg shadow-violet-950/40">✦</span>
            <span className="text-left"><span className="block text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Memory</span><span className="block text-lg font-black">Sequence Game</span></span>
          </button>
          <button type="button" onClick={() => setSettingsOpen((open) => !open)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300" aria-expanded={settingsOpen}>Settings</button>
        </header>

        {settingsOpen && (
          <section className="mt-4 ml-auto w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl" aria-label="Game settings">
            <label className="flex items-center justify-between gap-4 py-2"><span><span className="block font-bold">Sound feedback</span><span className="text-sm text-slate-400">Play a short tone after submission.</span></span><input type="checkbox" checked={state.profile.soundEnabled} onChange={(event) => dispatch({ type: 'SET_SOUND', enabled: event.target.checked })} className="h-5 w-5 accent-sky-400" /></label>
            <label className="flex items-center justify-between gap-4 border-t border-white/10 py-3"><span><span className="block font-bold">Reduce motion</span><span className="text-sm text-slate-400">Remove non-essential movement.</span></span><input type="checkbox" checked={state.profile.reduceMotion} onChange={(event) => dispatch({ type: 'SET_REDUCE_MOTION', enabled: event.target.checked })} className="h-5 w-5 accent-sky-400" /></label>
            <button type="button" onClick={resetData} className="mt-2 w-full rounded-xl border border-rose-400/30 px-4 py-2 text-sm font-bold text-rose-300 hover:bg-rose-400/10">Clear local game data</button>
          </section>
        )}

        {state.phase === 'home' && (
          <section className="flex flex-1 flex-col justify-center py-12 sm:py-16">
            <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-black uppercase tracking-[0.28em] text-sky-300">Watch · Remember · Rebuild</p><h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">How long a sequence can you remember?</h1><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Cards appear one at a time. Remember the order, then rebuild it from a shuffled set. Every correct round adds another card.</p></div>
            <div className="mx-auto mt-10 grid w-full max-w-4xl gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Choose a card category">
              {(Object.keys(categoryCopy) as Category[]).map((category) => {
                const selected = selectedCategory === category
                const item = categoryCopy[category]
                return <button key={category} type="button" role="radio" aria-checked={selected} onClick={() => setSelectedCategory(category)} className={`rounded-3xl border p-6 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${selected ? 'border-sky-400 bg-sky-400/15 shadow-xl shadow-sky-950/30' : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'}`}><span className="text-4xl" aria-hidden="true">{item.glyph}</span><span className="mt-5 block text-xl font-black text-white">{item.title}</span><span className="mt-2 block text-sm leading-6 text-slate-400">{item.description}</span><span className="mt-4 flex gap-2" aria-hidden="true">{CARD_SETS[category].slice(0, 4).map((card) => <span key={card.id} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-lg">{card.glyph}</span>)}</span></button>
              })}
            </div>
            <button type="button" onClick={startGame} className="mx-auto mt-8 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-8 py-4 text-lg font-black text-slate-950 shadow-xl shadow-violet-950/40 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200">Start with {categoryCopy[selectedCategory].title}</button>
            <div className="mx-auto mt-10 grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4"><StatPill label="Best score" value={state.profile.bestScore.toLocaleString()} /><StatPill label="Best length" value={state.profile.highestSequenceLength || '—'} /><StatPill label="Runs" value={state.profile.completedRuns} /><StatPill label="Rounds" value={state.profile.totalRoundsCompleted} /></div>
          </section>
        )}

        {state.phase !== 'home' && (
          <section className="flex flex-1 flex-col py-8">
            <div className="grid grid-cols-3 gap-3"><StatPill label="Score" value={state.score.toLocaleString()} /><StatPill label="Length" value={state.sequenceLength} /><StatPill label="Attempts" value={retryText} /></div>
            {state.phase === 'playback' && <div className="flex flex-1 flex-col items-center justify-center py-12 text-center" aria-live="polite"><p className="text-sm font-black uppercase tracking-[0.25em] text-sky-300">Memorize the sequence</p><p className="mt-3 text-slate-400">Card {Math.min(playbackIndex + 1, state.sequence.length)} of {state.sequence.length}</p><div className="mt-10 min-h-56">{cardVisible && activePlaybackCard ? <div className={state.profile.reduceMotion ? '' : 'animate-[pulse_1s_ease-in-out_1]'}><MemoryCard card={activePlaybackCard} category={state.category} size="large" /></div> : <div className="h-44 w-44 rounded-3xl border border-dashed border-white/10 sm:h-56 sm:w-56" aria-hidden="true" />}</div><div className="mt-8 flex gap-2" aria-hidden="true">{state.sequence.map((card, index) => <span key={card.instanceId} className={`h-2 rounded-full transition-all ${index === playbackIndex && cardVisible ? 'w-8 bg-sky-400' : index < playbackIndex ? 'w-2 bg-violet-400' : 'w-2 bg-white/15'}`} />)}</div></div>}
            {state.phase === 'recall' && <div className="flex flex-1 flex-col items-center py-10"><p className="text-sm font-black uppercase tracking-[0.25em] text-sky-300">Rebuild the order</p><h2 className="mt-3 text-3xl font-black text-white">What did you see?</h2><p className="mt-2 text-center text-slate-400">Choose cards in the same order. You can undo before submitting.</p><ol className="mt-8 flex max-w-full gap-3 overflow-x-auto rounded-3xl border border-white/10 bg-white/5 p-4" aria-label="Your recalled sequence">{state.sequence.map((_, index) => { const selected = state.selection[index]; return <li key={index} className="shrink-0">{selected ? <MemoryCard card={selected} category={state.category} /> : <div className="grid h-20 w-20 place-items-center rounded-3xl border-2 border-dashed border-white/15 text-lg font-black text-slate-600 sm:h-24 sm:w-24" aria-label={`Empty position ${index + 1}`}>{index + 1}</div>}</li> })}</ol><div className="mt-8 flex max-w-3xl flex-wrap justify-center gap-3" aria-label="Available cards">{state.recallPool.map((card) => <MemoryCard key={card.instanceId} card={card} category={state.category} selected={selectedIds.has(card.instanceId)} disabled={selectedIds.has(card.instanceId)} onClick={() => dispatch({ type: 'SELECT_CARD', card })} />)}</div><div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" disabled={state.selection.length === 0} onClick={() => dispatch({ type: 'UNDO' })} className="rounded-2xl border border-white/15 px-6 py-3 font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35">Undo</button><button type="button" disabled={state.selection.length !== state.sequence.length} onClick={() => dispatch({ type: 'SUBMIT', now: Date.now() })} className="rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-7 py-3 font-black text-slate-950 shadow-lg disabled:cursor-not-allowed disabled:opacity-35">Submit sequence</button></div></div>}
            {state.phase === 'feedback' && <div className="flex flex-1 flex-col items-center py-10 text-center" aria-live="assertive"><span className="text-6xl" aria-hidden="true">{state.lastAnswerCorrect ? '🎉' : state.mistakes >= 2 ? '🧠' : '↻'}</span><p className={`mt-5 text-sm font-black uppercase tracking-[0.25em] ${state.lastAnswerCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>{state.lastAnswerCorrect ? 'Sequence remembered' : state.mistakes >= 2 ? 'Second mistake' : 'Retry activated'}</p><h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">{state.lastAnswerCorrect ? `+${state.lastRoundPoints.toLocaleString()} points` : state.mistakes >= 2 ? 'That ends this run' : 'Same length, one more try'}</h2><p className="mt-3 max-w-xl text-slate-400">The original sequence is shown below. Green positions matched; red positions were different.</p><ol className="mt-8 flex max-w-full gap-3 overflow-x-auto rounded-3xl border border-white/10 bg-white/5 p-4" aria-label="Correct sequence and results">{state.sequence.map((card, index) => <li key={card.instanceId}><MemoryCard card={card} category={state.category} status={state.validation[index] ? 'correct' : 'incorrect'} /></li>)}</ol>{state.lastRecallTimeMs !== null && <p className="mt-5 text-sm text-slate-500">Recall time: {(state.lastRecallTimeMs / 1000).toFixed(1)} seconds</p>}<button type="button" onClick={() => dispatch({ type: 'CONTINUE' })} className="mt-8 rounded-2xl bg-white px-7 py-3 font-black text-slate-950 hover:bg-sky-100">{state.mistakes >= 2 && !state.lastAnswerCorrect ? 'View run results' : 'Continue'}</button></div>}
            {state.phase === 'game-over' && <div className="flex flex-1 flex-col items-center justify-center py-12 text-center"><p className="text-sm font-black uppercase tracking-[0.25em] text-violet-300">Run complete</p><h2 className="mt-4 text-5xl font-black text-white">{state.score.toLocaleString()} points</h2><p className="mt-4 max-w-lg text-slate-400">You reached a sequence length of {state.sequenceLength}. Your best score is {state.profile.bestScore.toLocaleString()}.</p><div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-3"><StatPill label="Final score" value={state.score.toLocaleString()} /><StatPill label="Sequence length" value={state.sequenceLength} /></div><div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => dispatch({ type: 'PLAY_AGAIN' })} className="rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-7 py-3 font-black text-slate-950">Play again</button><button type="button" onClick={() => dispatch({ type: 'HOME' })} className="rounded-2xl border border-white/15 px-7 py-3 font-bold text-white hover:bg-white/10">Change category</button></div></div>}
          </section>
        )}
        <div className="sr-only" aria-live="polite">{state.phase === 'playback' && `Playing card ${playbackIndex + 1} of ${state.sequence.length}.`}{state.phase === 'recall' && `Recall phase. ${state.selection.length} of ${state.sequence.length} positions filled.`}</div>
      </div>
    </main>
  )
}
