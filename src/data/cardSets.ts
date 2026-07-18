import type { CardDefinition, Category } from '../domain/types'

const colours: CardDefinition[] = [
  { id: 'sunset', category: 'colours', label: 'Sunset orange', glyph: '☀', colour: '#f97316', pattern: 'diagonal' },
  { id: 'ocean', category: 'colours', label: 'Ocean blue', glyph: '≈', colour: '#2563eb', pattern: 'waves' },
  { id: 'forest', category: 'colours', label: 'Forest green', glyph: '✦', colour: '#16a34a', pattern: 'dots' },
  { id: 'berry', category: 'colours', label: 'Berry purple', glyph: '◆', colour: '#9333ea', pattern: 'diamond' },
  { id: 'rose', category: 'colours', label: 'Rose pink', glyph: '✿', colour: '#e11d48', pattern: 'petals' },
  { id: 'lemon', category: 'colours', label: 'Lemon yellow', glyph: '●', colour: '#eab308', pattern: 'circles' },
  { id: 'slate', category: 'colours', label: 'Slate grey', glyph: '▦', colour: '#475569', pattern: 'grid' },
  { id: 'aqua', category: 'colours', label: 'Aqua teal', glyph: '✧', colour: '#0d9488', pattern: 'spark' },
]

const shapes: CardDefinition[] = [
  { id: 'circle', category: 'shapes', label: 'Circle', glyph: '●' },
  { id: 'triangle', category: 'shapes', label: 'Triangle', glyph: '▲' },
  { id: 'square', category: 'shapes', label: 'Square', glyph: '■' },
  { id: 'diamond', category: 'shapes', label: 'Diamond', glyph: '◆' },
  { id: 'star', category: 'shapes', label: 'Star', glyph: '★' },
  { id: 'hexagon', category: 'shapes', label: 'Hexagon', glyph: '⬢' },
  { id: 'heart', category: 'shapes', label: 'Heart', glyph: '♥' },
  { id: 'cross', category: 'shapes', label: 'Cross', glyph: '✚' },
]

const icons: CardDefinition[] = [
  { id: 'apple', category: 'icons', label: 'Apple', glyph: '🍎' },
  { id: 'bicycle', category: 'icons', label: 'Bicycle', glyph: '🚲' },
  { id: 'camera', category: 'icons', label: 'Camera', glyph: '📷' },
  { id: 'rocket', category: 'icons', label: 'Rocket', glyph: '🚀' },
  { id: 'music', category: 'icons', label: 'Music note', glyph: '🎵' },
  { id: 'tree', category: 'icons', label: 'Tree', glyph: '🌳' },
  { id: 'key', category: 'icons', label: 'Key', glyph: '🔑' },
  { id: 'book', category: 'icons', label: 'Book', glyph: '📘' },
]

export const CARD_SETS: Record<Category, CardDefinition[]> = { colours, shapes, icons }

export const getCardDefinition = (category: Category, cardId: string) =>
  CARD_SETS[category].find((card) => card.id === cardId)
