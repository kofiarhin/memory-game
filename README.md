# Memory Game

A responsive visual sequence-memory game where players watch cards appear one at a time, then rebuild the sequence from a shuffled set.

## MVP

- Colours, shapes, and familiar icon categories
- Sequences start at three cards and grow after correct rounds
- One retry per run
- Repeated cards from sequence length six onward
- Position-level feedback and original-sequence reveal
- Local best score, best length, settings, and recall statistics
- Touch, mouse, keyboard, reduced-motion, and accessible card labels
- No account or backend required

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Vitest and React Testing Library

## Run locally

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm test
npm run lint
npm run build
```

## Game rules

1. Choose colours, shapes, or icons.
2. Memorize the cards shown one at a time.
3. Rebuild the order from the shuffled card pool.
4. A correct round adds one card and awards `sequence length² × 10` points.
5. The first mistake uses the retry. The second mistake ends the run.

See [PRD.md](./PRD.md) for the complete product requirements.
