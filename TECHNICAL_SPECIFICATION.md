# Memory Game Technical Specification

## 1. Scope

Memory Game is a client-side visual sequence-recall game built with React, TypeScript, Vite, and Tailwind CSS. Players choose a card category, watch a timed sequence, reconstruct it from a shuffled recall pool, and continue until a second incorrect submission ends the run.

The application requires no backend or account system.

## 2. Technology stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Vitest 4
- React Testing Library and jsdom
- Oxlint

## 3. Repository structure

```text
src/
  App.tsx                 application composition and game flow
  App.test.tsx            primary interaction tests
  components/             reusable UI components
  data/                   category and card definitions
  domain/                 pure sequence, scoring, and validation rules
  game/                   session state and transitions
  persistence/            browser-storage adapter
  test/                   test setup and helpers
  main.tsx                React entrypoint
  index.css               global styles
PRD.md                    approved product requirements
README.md                 setup and gameplay overview
```

## 4. Architectural principles

- Keep sequence generation, scoring, and validation in pure domain functions.
- Keep timers and playback orchestration separate from domain rules.
- Treat static card definitions as immutable input data.
- Keep browser storage behind a persistence adapter.
- Validate every action against the current game phase.
- Make randomness injectable or seedable for deterministic tests.
- Do not couple correctness to animation completion events.

## 5. Domain model

A session should be representable with equivalent typed state:

```ts
type Category = "colours" | "shapes" | "icons";

type GamePhase =
  | "idle"
  | "category-selection"
  | "preparing"
  | "playback"
  | "recall"
  | "submitted"
  | "feedback"
  | "game-over";

interface CardDefinition {
  id: string;
  category: Category;
  label: string;
  symbol?: string;
  visualToken: string;
}

interface SequenceEntry {
  instanceId: string;
  cardId: string;
}

interface GameSession {
  category: Category;
  phase: GamePhase;
  sequence: SequenceEntry[];
  recallPool: SequenceEntry[];
  selections: SequenceEntry[];
  sequenceLength: number;
  score: number;
  retryAvailable: boolean;
  highestLength: number;
  roundStartedAt?: number;
  recallStartedAt?: number;
  recallDurationMs?: number;
}
```

Repeated cards must use distinct instance identifiers so identical card definitions can occupy independent sequence positions.

## 6. Sequence generation

### Rules

- Every run starts at sequence length three.
- Lengths three through five contain unique card definitions.
- Length six and above may contain repeated card definitions.
- The recall pool must contain the exact number of selectable instances needed to reconstruct the sequence.
- The recall pool is shuffled independently from the playback order.

### Randomness

Use Fisher-Yates or an equivalent unbiased shuffle. Random-dependent functions should accept a random-number source so tests can supply a seeded or mocked implementation.

## 7. Playback timing

For every sequence entry:

1. Show the active card for 1,000 milliseconds.
2. Hide it for a 300 millisecond gap.
3. Continue until all entries have played.
4. Transition to recall only after playback completes.

Input is disabled during `preparing`, `playback`, `submitted`, and non-interactive feedback transitions.

Timing should be centralized in a hook, service, or state-machine effect. Tests must use fake timers rather than real delays.

## 8. Recall behavior

- The interface renders one ordered slot per sequence position.
- Selecting a recall-pool instance fills the next empty slot.
- A selected instance cannot be selected again unless first removed.
- Undo removes the most recent selection and returns that instance to the pool.
- Submit is disabled until every slot is filled.
- Keyboard, mouse, and touch input must produce the same state transitions.
- Rapid repeated input must be guarded by phase and selection-state checks.

## 9. Validation and progression

Validation compares submitted entries to the sequence position by position.

### Correct submission

- Mark every position correct.
- Award `sequence length² × 10` points.
- Preserve the retry state.
- Increase sequence length by one.
- Begin a new round.

### First incorrect submission

- Mark each position correct or incorrect.
- Reveal the original sequence.
- Consume the retry.
- Preserve the current sequence length.
- Begin a new round at the same length.

### Second incorrect submission

- Mark each position.
- Reveal the original sequence.
- End the run.
- Persist updated personal records.
- Show final score and highest sequence length.

Only correct rounds award points.

## 10. State transitions

```text
idle
  -> category-selection

category-selection
  -> preparing

preparing
  -> playback

playback
  -> recall

recall
  -> submitted

submitted
  -> feedback

feedback
  -> preparing      correct answer or first incorrect answer
  -> game-over      second incorrect answer

game-over
  -> preparing      play again with selected category
  -> category-selection
```

Actions that do not belong to the current phase must be ignored or rejected without corrupting session state.

## 11. Persistence

The browser-storage adapter may persist:

- schema version;
- best score;
- highest sequence length;
- preferred category;
- sound setting;
- reduced-motion override;
- optional aggregate recall statistics.

An active run is not persisted by default.

### Requirements

- Namespace all storage keys.
- Validate parsed values before use.
- Tolerate missing, malformed, or unavailable storage.
- Migrate supported older schemas or reset safely.
- Provide a user action to clear stored game data.
- Keep gameplay available when persistence fails.

Example envelope:

```ts
interface PersistedGameData {
  version: number;
  bestScore: number;
  highestSequenceLength: number;
  preferredCategory?: Category;
  soundEnabled?: boolean;
  reducedMotionOverride?: boolean;
}
```

## 12. Component responsibilities

### Start/category screen

- Explain the game briefly.
- Display local records.
- Let the player choose colours, shapes, or icons.
- Expose settings and start action.

### Playback view

- Render one active card at a time.
- Display score, sequence length, retry state, and subtle progress.
- Expose no recall controls.

### Recall view

- Render ordered slots and shuffled instances.
- Support selection, undo, and submit.
- Preserve accessible names and logical keyboard order.

### Feedback view

- Mark every submitted position.
- Show the original sequence.
- Explain retry or progression state with encouraging language.

### Game-over view

- Display final score, highest length, personal-best state, category, replay, and category-change actions.

## 13. Accessibility

- All controls must be keyboard operable.
- Focus order must follow interaction order.
- Focus indicators must remain visible.
- Cards require accessible names.
- Colour cards must also use labels, patterns, or symbols.
- Correct and incorrect states cannot rely on colour alone.
- Playback, feedback, and game-over changes should use appropriate live regions.
- Motion must respect `prefers-reduced-motion` without changing timing rules or game logic.
- Sound is optional and never the only feedback channel.
- Touch targets must be comfortably sized.

## 14. Responsive behavior

- Primary gameplay must work on mobile, tablet, and desktop.
- Long recall-slot sets may wrap or scroll horizontally.
- The card grid must avoid viewport overflow.
- Sequence lengths of at least 20 must remain usable.
- Wide layouts should use a readable maximum width rather than stretching cards excessively.

## 15. Error handling

- Malformed stored data falls back to defaults.
- Storage failure does not prevent play.
- Missing card assets use a safe textual or symbolic fallback.
- Timer cleanup occurs when phases change or components unmount.
- Impossible transitions are ignored or reported during development.
- Refreshing during a run returns safely to the start state.

## 16. Testing strategy

### Domain tests

- unique generation for lengths three through five;
- repeated-card generation from length six;
- deterministic seeded generation;
- recall-pool instance counts for duplicates;
- score calculation;
- position-by-position validation;
- retry consumption;
- correct progression;
- game-over transition.

### Persistence tests

- valid current-version data loads;
- malformed JSON falls back safely;
- unsupported versions reset or migrate;
- unavailable storage does not crash the app;
- clear-data resets records and settings.

### Interaction tests

- category selection starts a run;
- playback locks input;
- fake timers advance through playback;
- card selection fills the next slot;
- duplicate instances remain independently selectable;
- undo removes the latest selection;
- submit remains disabled until complete;
- correct, first-incorrect, and second-incorrect flows behave correctly;
- keyboard interaction and accessible labels work;
- reduced-motion mode preserves game behavior.

### Required commands

```bash
npm run lint
npm test
npm run build
```

Optional coverage:

```bash
npm run coverage
```

## 17. CI requirements

On pull requests and `main`:

1. Install dependencies from the lockfile.
2. Run Oxlint.
3. Run Vitest.
4. Run the TypeScript and Vite production build.
5. Publish coverage when configured.
6. Deploy only after required checks succeed.

## 18. Acceptance criteria

The technical baseline is complete when:

- game rules match the approved PRD;
- early sequences are unique and later duplicate sequences remain reconstructable;
- playback timing is centralized and testable;
- invalid phase actions cannot corrupt state;
- local records survive refresh and malformed storage fails safely;
- the complete game is playable with keyboard, mouse, and touch;
- lint, test, and build pass;
- README, PRD, and this specification remain aligned;
- the production bundle runs as a static site without a backend.
