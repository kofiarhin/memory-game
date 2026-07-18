import { getCardDefinition } from '../data/cardSets'
import type { Category, SequenceCard } from '../domain/types'

type MemoryCardProps = {
  card: SequenceCard
  category: Category
  size?: 'small' | 'large'
  selected?: boolean
  disabled?: boolean
  status?: 'correct' | 'incorrect'
  onClick?: () => void
}

export function MemoryCard({
  card,
  category,
  size = 'small',
  selected = false,
  disabled = false,
  status,
  onClick,
}: MemoryCardProps) {
  const definition = getCardDefinition(category, card.cardId)
  if (!definition) return null

  const sizing = size === 'large' ? 'h-44 w-44 text-7xl sm:h-56 sm:w-56 sm:text-8xl' : 'h-20 w-20 text-3xl sm:h-24 sm:w-24 sm:text-4xl'
  const statusClass =
    status === 'correct'
      ? 'ring-4 ring-emerald-400'
      : status === 'incorrect'
        ? 'ring-4 ring-rose-400'
        : selected
          ? 'ring-4 ring-sky-400 opacity-55'
          : 'ring-1 ring-white/15'
  const background = definition.colour ? { backgroundColor: definition.colour } : undefined
  const content = (
    <>
      <span aria-hidden="true" className="drop-shadow-sm">{definition.glyph}</span>
      <span className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/95 sm:text-xs">{definition.label}</span>
    </>
  )
  const classes = `${sizing} ${statusClass} relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-slate-700 p-2 text-white shadow-xl shadow-slate-950/20 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed`

  if (onClick) {
    return (
      <button
        type="button"
        className={`${classes} enabled:hover:-translate-y-1 enabled:hover:shadow-2xl`}
        style={background}
        aria-label={definition.label}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
      >
        <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_45%)]" />
        {content}
      </button>
    )
  }

  return (
    <div className={classes} style={background} aria-label={definition.label} role="img">
      <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_45%)]" />
      {content}
    </div>
  )
}
