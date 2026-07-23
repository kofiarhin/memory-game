# Memory Game Technical Specification

## 1. Scope

Memory Game is a client-side React application implemented in TypeScript and built with Vite. This specification documents the application architecture, gameplay state, persistence boundaries, testing strategy, and delivery requirements represented by the repository.

## 2. Technology stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4 through the Vite plugin
- Vitest 4
- Testing Library and jsdom
- Oxlint

The application has no required backend service in the documented baseline.

## 3. Repository structure

```text
src/
  App.tsx                 top-level application composition and state flow
  App.test.tsx            application behavior tests
  components/             reusable presentation components
  data/                   static card or game content
  domain/                 domain types and rules
  game/                   game-state and gameplay logic
  persistence/            browser persistence adapters
  test/                   shared test setup and helpers
  main.tsx                React entrypoint
  index.css               global styles
PRD.md                    product requirements
README.md                 setup and usage
```

## 4. Architectural principles

- Keep deterministic game rules outside presentation components.
- Treat UI state and persisted player state as separate concerns.
- Keep static card data independent from game-session state.
- Make randomization injectable or testable where practical.
- Use typed domain models for cards, turns, matches, difficulty, and saved progress.
- Avoid coupling gameplay correctness to animation timing.

## 5. Domain model

A game session should be representable with the following conceptual data:

```ts
type CardId = string;

type CardState = "hidden" | "revealed" | "matched";

interface Card {
  id: CardId;
  pairKey: string;
  label: string;
  asset?: string;
  state: CardState;
}

interface GameSession {
  cards: Card[];
  selectedCardIds: CardId[];
  moves: number;
  matches: number;
  startedAt?: number;
  completedAt?: number;
  status: "idle" | "playing" | "resolving" | "complete";
}
```

The implementation may use different names, but equivalent state must be explicit and serializable where persistence is supported.

## 6. Game rules

1. A new game creates pairs from the selected card set.
2. Cards are shuffled before play.
3. A player may reveal no more than two unmatched cards at a time.
4. Selecting an already matched card has no effect.
5. Selecting the same revealed card twice has no effect.
6. When two revealed cards share the same pair key, both become matched.
7. When they do not match, both return to hidden after the resolution period.
8. A move is counted when the second valid card is revealed.
9. The game completes when all pairs are matched.
10. Input is blocked while a mismatch is resolving.

## 7. State transitions

```text
idle
  -> playing                first valid card selection or explicit start

playing
  -> playing                first card revealed
  -> resolving              second card revealed and comparison pending
  -> complete               final pair matched

resolving
  -> playing                pair matched or mismatch reset completed

complete
  -> idle or playing        restart/new game
```

State transitions should be implemented through pure functions or clearly isolated update logic so they can be unit tested.

## 8. Randomization

The shuffle algorithm should use Fisher-Yates or an equivalent unbiased method.

Requirements:

- create a new array rather than mutating canonical static data;
- preserve exactly two instances for each pair in the selected deck;
- support deterministic tests by allowing a seeded or mocked random source;
- generate stable per-card instance identifiers even when pair keys repeat.

## 9. Persistence

Browser persistence may store preferences, best results, or resumable state through the `persistence/` boundary.

### Allowed persisted data

- selected difficulty or deck;
- sound or accessibility preferences;
- best score or completion time;
- resumable session state when explicitly supported.

### Requirements

- namespace storage keys;
- version serialized data;
- validate parsed data before use;
- recover safely from malformed or stale data;
- avoid storing unnecessary personal data;
- keep storage access out of pure game-rule modules.

Example envelope:

```ts
interface PersistedEnvelope<T> {
  version: number;
  savedAt: string;
  data: T;
}
```

## 10. Component responsibilities

### Application component

- selects or creates the game session;
- coordinates game actions and persistence;
- displays start, active, and completion states;
- passes typed props to presentation components.

### Board component

- renders the card grid;
- exposes card selection callbacks;
- reflects disabled and resolving states;
- adapts layout to deck size and viewport.

### Card component

- renders hidden, revealed, and matched states;
- uses a semantic button or equivalent keyboard-accessible control;
- exposes an accessible name that does not reveal hidden information;
- prevents interaction when disabled or matched.

### Score and status components

- display moves, matches, timer, and completion status;
- announce important state changes through appropriate accessible live regions.

## 11. Accessibility requirements

- Every interactive card must be keyboard operable.
- Focus indicators must remain visible.
- Hidden cards must not expose their pair identity to assistive technology before reveal.
- Matched and revealed states must be communicated without relying on color alone.
- Motion should respect reduced-motion preferences.
- The board must preserve a logical focus order.
- Completion and restart actions must be clearly announced and reachable.

## 12. Responsive behavior

- The board must remain usable on common mobile widths.
- Card aspect ratios should remain consistent.
- The grid should adapt columns to deck size and available width.
- Controls and status information must not obscure the board.
- Touch targets should meet common accessibility sizing guidance.

## 13. Error handling

Because the application is client-side, error handling focuses on recoverable state:

- invalid persisted data falls back to defaults;
- missing static assets show a safe fallback;
- impossible state transitions are ignored or reported in development;
- storage failures do not prevent a game session;
- application errors should be captured by an error boundary where appropriate.

## 14. Testing strategy

### Domain tests

- deck creation produces exact pairs;
- shuffle preserves all cards;
- first selection reveals one card;
- second selection increments moves;
- matching cards stay revealed;
- mismatched cards return to hidden;
- input is blocked during resolution;
- final match completes the game;
- restart resets session counters and card state.

### Persistence tests

- valid current-version data loads;
- malformed JSON falls back safely;
- unsupported versions are ignored or migrated;
- storage write failures do not crash gameplay.

### Component tests

- cards can be selected by mouse and keyboard;
- selected and matched states render correctly;
- score and completion status update;
- restart starts a clean session;
- inaccessible duplicate interaction is prevented.

### Build verification

```bash
npm run lint
npm test
npm run build
```

Coverage is available through:

```bash
npm run coverage
```

## 15. Performance requirements

- Game interactions should remain responsive for all supported deck sizes.
- Re-renders should be limited to affected game components where practical.
- Static assets should be appropriately sized and cached.
- Timers should use one stable interval or derived elapsed time rather than unnecessary frequent state updates.

## 16. CI requirements

The repository CI should run on pull requests and `main`:

1. install dependencies with the lockfile;
2. run Oxlint;
3. run Vitest;
4. run the TypeScript and Vite production build;
5. optionally publish coverage artifacts;
6. deploy only from a successful protected branch workflow.

## 17. Acceptance criteria

The implementation is technically complete for the documented baseline when:

- all game rules are enforced independently of UI timing;
- a game can be completed using keyboard-only interaction;
- invalid persisted data does not break startup;
- lint, test, and build commands pass;
- README, PRD, and this technical specification remain aligned with implemented features;
- the production bundle can be served as a static site without a backend dependency.
