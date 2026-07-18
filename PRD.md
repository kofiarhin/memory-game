# Memory Game — Product Requirements Document

**Product name:** Memory Game  
**Working project name:** Memory Sequence Game  
**Repository:** `kofiarhin/memory-game`  
**Document status:** Approved MVP definition  
**Date:** 2026-07-18  
**Lifecycle:** Exploring

## 1. Product Summary

Memory Game is a responsive browser-based memory-training game for players aged 8 and above.

The player chooses a visual card category, watches a sequence of cards appear one at a time, and then reconstructs the sequence from memory using a shuffled card grid. Each successful round increases the sequence length. The run ends after the player makes two incorrect submissions.

The product is positioned as a casual memory game. It must not make medical, therapeutic, diagnostic, or cognitive-health claims.

## 2. Problem

Many memory games are either overly simplistic, focused on matching pairs, or designed around reaction speed rather than sequential recall.

Players need a low-friction game that:

- is immediately understandable;
- works on mobile and desktop;
- gradually increases difficulty;
- focuses on visual sequence memory;
- provides clear feedback after mistakes;
- requires no account or installation.

## 3. Product Goals

The MVP must:

1. Deliver a clear and enjoyable visual sequence-memory loop.
2. Allow a player to begin a run within a few interactions.
3. Increase difficulty progressively through sequence length and repeated cards.
4. Support touch, mouse, and keyboard input.
5. Persist personal bests and settings locally.
6. Remain accessible to players who cannot rely on colour alone.
7. Work without a backend or account system.

## 4. Non-Goals

The MVP will not include:

- user accounts;
- backend APIs;
- MongoDB or cloud persistence;
- online leaderboards;
- multiplayer;
- daily challenges;
- timed game modes;
- mixed-category sequences;
- user-created card decks;
- native mobile applications;
- monetisation;
- medical assessments or health claims.

## 5. Target Audience

### Primary audience

General players aged 8 and above who enjoy short, casual memory challenges.

### Player expectations

Players should be able to:

- understand the game without reading lengthy instructions;
- complete a run in a few minutes;
- see personal improvement through best scores;
- use the game comfortably on a phone, tablet, or desktop;
- play without creating an account.

## 6. Core Gameplay

### 6.1 Category selection

Before a run begins, the player chooses one category:

- Colours
- Shapes
- Familiar icons

A run uses only the chosen category.

Mixed-category sequences are reserved for a future version.

### 6.2 Sequence generation

A run starts with a sequence length of three cards.

For sequence lengths three through five:

- every card in the sequence must be unique.

From sequence length six onward:

- cards may repeat;
- repeated cards must remain valid independent sequence positions;
- the recall grid must provide enough selectable instances to reconstruct the exact sequence.

The sequence generator must be deterministic when supplied with a seeded random source so it can be tested and replayed reliably.

### 6.3 Playback

The game presents the sequence one card at a time.

Playback timing:

- each card is visible for 1,000 milliseconds;
- a 300 millisecond gap appears between cards;
- player input is disabled until playback completes.

Playback speed does not increase during a run.

Difficulty increases through:

- longer sequences;
- repeated cards from sequence length six onward.

### 6.4 Recall phase

After playback:

1. Ordered empty slots appear for every sequence position.
2. A shuffled card grid appears below the slots.
3. Selecting a card fills the next empty slot.
4. The player can undo the latest selection.
5. Submit remains disabled until every slot is filled.
6. The player submits the reconstructed sequence for validation.

The interaction must support:

- touch;
- mouse;
- keyboard navigation and activation.

### 6.5 Validation and feedback

After submission:

- each slot is immediately marked correct or incorrect;
- the original sequence is briefly revealed;
- the updated score is shown;
- the remaining retry state is shown;
- feedback uses encouraging, non-punitive language.

A correct answer:

- awards points;
- increases the sequence length by one;
- begins the next round.

The first incorrect answer:

- consumes the single retry;
- keeps the same sequence length;
- begins a new round at that length.

The second incorrect answer:

- ends the run;
- shows the final score;
- shows the highest sequence length reached;
- shows whether a new personal best was achieved.

## 7. Scoring

The score must reward longer sequences progressively.

Initial MVP scoring formula:

`round points = sequence length² × 10`

Examples:

- length 3: 90 points;
- length 4: 160 points;
- length 5: 250 points;
- length 6: 360 points.

Only correct rounds award points.

Recall speed does not affect score.

The game may record recall duration as a personal statistic, but it must not pressure the player with countdowns or speed penalties.

## 8. Run State

A run must track:

- selected category;
- current sequence;
- current sequence length;
- player selections;
- score;
- retry available or consumed;
- current phase;
- round start time;
- recall duration;
- highest sequence length reached during the run.

Recommended phases:

- `idle`
- `category-selection`
- `preparing`
- `playback`
- `recall`
- `submitted`
- `feedback`
- `game-over`

Invalid actions must be ignored when they do not belong to the current phase.

## 9. Persistence

The MVP uses browser storage only.

Persist:

- best score;
- highest sequence length;
- preferred category;
- sound setting;
- reduced-motion preference override, when applicable;
- optional personal recall statistics;
- schema version.

Do not persist an active run by default.

Refreshing during a run should safely return the player to the start screen without corrupting saved statistics.

Storage handling must:

- tolerate missing values;
- tolerate malformed JSON;
- migrate or reset unsupported schema versions safely;
- allow gameplay to continue when storage is unavailable.

Provide a control to clear locally stored game data.

## 10. Screens and User Flow

### 10.1 Start screen

Display:

- product title;
- concise explanation;
- category choices;
- best score;
- highest sequence length;
- settings access;
- start action.

### 10.2 Playback screen

Display:

- current round or sequence length;
- current score;
- retry state;
- central active card;
- subtle progress indicator;
- no interactive recall controls.

### 10.3 Recall screen

Display:

- ordered sequence slots;
- shuffled card grid;
- undo control;
- submit control;
- current score;
- retry state.

### 10.4 Feedback screen

Display:

- position-level correctness;
- original sequence;
- score update;
- retry status;
- next-round or game-over transition.

### 10.5 Game-over screen

Display:

- final score;
- highest sequence length reached;
- personal-best result;
- category used;
- play-again action;
- change-category action.

## 11. Accessibility Requirements

The game must meet the following baseline requirements:

- All controls are keyboard accessible.
- Focus order follows the visual interaction order.
- Focus states are clearly visible.
- Cards have accessible names.
- Colour cards do not rely on colour alone.
- Colour cards include labels, symbols, or patterns.
- Correct and incorrect states are not communicated through colour alone.
- Status changes are announced through appropriate live regions.
- Motion respects `prefers-reduced-motion`.
- Reduced-motion mode removes non-essential movement without changing timing rules or game logic.
- Text and controls maintain readable contrast.
- Touch targets are appropriately sized for mobile use.
- Sound is optional and never the only feedback channel.

## 12. Responsive Requirements

The game must work across common mobile, tablet, and desktop viewport sizes.

### Mobile

- Controls must be reachable without precision tapping.
- Recall slots may wrap or scroll horizontally for long sequences.
- The card grid must avoid overflow.
- Primary actions must remain visible without excessive scrolling.

### Desktop

- The game board should remain centred with a readable maximum width.
- Keyboard interaction must be complete.
- Wide layouts must not stretch cards excessively.

The interface should support sequence lengths of at least 20 without becoming unusable.

## 13. Visual Direction

The MVP should feel:

- playful;
- calm;
- clear;
- modern;
- encouraging.

Avoid:

- clinical medical styling;
- aggressive countdown visuals;
- excessive animation;
- visually noisy backgrounds;
- feedback that shames mistakes.

Card sets should share a consistent visual system while remaining clearly distinguishable.

## 14. Technical Direction

Recommended stack:

- React;
- latest Vite;
- Tailwind CSS;
- Vitest;
- React Testing Library;
- TypeScript.

No backend is required.

Recommended architectural boundaries:

- keep sequence generation and scoring in pure domain functions;
- keep browser storage behind a persistence adapter;
- keep timing logic in dedicated hooks or services;
- keep card definitions outside UI components;
- use component state or a reducer for game-session state;
- avoid Redux Toolkit unless state becomes genuinely global;
- avoid TanStack Query because the MVP has no server state.

Suggested source structure:

```text
src/
  app/
  components/
  features/game/
    components/
    hooks/
    gameReducer.ts
    gameTypes.ts
  domain/
    sequence.ts
    scoring.ts
    validation.ts
  data/
    cardSets.ts
  persistence/
    localGameStorage.ts
  pages/
  test/
```

## 15. Functional Requirements

### FR-1: Start a run

The player can choose colours, shapes, or icons and start a run.

### FR-2: Initial difficulty

Every new run starts at sequence length three with one retry available.

### FR-3: Playback timing

Cards display for one second each with a 300 millisecond gap.

### FR-4: Input locking

Recall input is unavailable during playback and feedback transitions.

### FR-5: Unique early sequences

Sequences through length five contain no duplicate cards.

### FR-6: Repeated advanced sequences

Sequences from length six onward may contain repeated cards.

### FR-7: Ordered reconstruction

Selecting a card fills the next available sequence slot.

### FR-8: Undo

The player can remove the most recently selected card before submitting.

### FR-9: Submission readiness

The submit control is disabled until all sequence slots are filled.

### FR-10: Correct progression

A correct answer awards points and increases sequence length by one.

### FR-11: Retry behaviour

The first incorrect answer consumes the retry and preserves the sequence length.

### FR-12: Game over

The second incorrect answer ends the run.

### FR-13: Position feedback

Every submitted slot is visibly and accessibly marked correct or incorrect.

### FR-14: Sequence reveal

The original sequence is shown after submission.

### FR-15: Local records

Best score and highest sequence length survive a browser refresh.

### FR-16: Data reset

The player can clear locally stored progress and settings.

### FR-17: Multi-input support

The full game is playable with touch, mouse, and keyboard.

## 16. Acceptance Criteria

1. A player can select colours, shapes, or icons and start a run.
2. Every run starts with a three-card sequence.
3. Each card displays for one second with a 300 millisecond gap.
4. Early sequences contain no duplicate cards.
5. Duplicate cards may appear from sequence length six onward.
6. Playback input remains disabled until the sequence finishes.
7. The recall screen displays ordered slots and a shuffled choice grid.
8. Selecting a card fills the next available slot.
9. Undo removes the most recent selection.
10. Submit is disabled until all slots are filled.
11. A correct answer increases score and sequence length.
12. A first incorrect answer consumes the retry and keeps the same length.
13. A second incorrect answer ends the run.
14. Submitted answers identify every correct and incorrect position.
15. The correct sequence is shown after an incorrect submission.
16. Best score and highest sequence length survive refresh.
17. Clearing game data resets local progress.
18. The game is usable with touch, mouse, and keyboard.
19. The interface works on common mobile and desktop sizes.
20. Automated tests cover sequence generation, duplicate rules, scoring, retries, validation, persistence, and primary interactions.

## 17. Testing Requirements

Use test-driven development for domain logic and critical interactions.

### Unit tests

Cover:

- unique sequence generation;
- repeated-card generation rules;
- seeded generation;
- scoring;
- sequence validation;
- retry transitions;
- game-over transitions;
- persistence parsing and migration;
- malformed storage handling.

### Component and interaction tests

Cover:

- category selection;
- playback input lock;
- slot filling;
- undo;
- disabled submit state;
- correct submission;
- first incorrect submission;
- second incorrect submission;
- accessible labels;
- keyboard interaction;
- reduced-motion behaviour.

Use fake timers for playback and transition tests.

## 18. Analytics and Success Measures

The MVP does not require third-party analytics.

Locally measurable product indicators may include:

- runs started;
- rounds completed;
- average highest sequence length;
- category preference;
- retry usage;
- personal-best improvements.

Success for the first release means:

- the complete gameplay loop works without a backend;
- players can understand the game without extensive instructions;
- the game is usable on mobile and desktop;
- automated tests protect the core rules;
- saved records remain reliable.

## 19. Risks and Mitigations

### Repeated-card ambiguity

**Risk:** Duplicate cards may be impossible to select correctly.

**Mitigation:** Generate a recall pool containing the exact required card instances.

### Rapid input

**Risk:** Double taps or clicks create unintended selections.

**Mitigation:** Debounce or guard actions through phase and state validation.

### Long sequences

**Risk:** Slots overflow and playback becomes lengthy.

**Mitigation:** Use wrapping or horizontal scrolling and test sequences of at least length 20.

### Colour accessibility

**Risk:** Players cannot distinguish colour cards.

**Mitigation:** Add labels, patterns, or symbols and accessible names.

### Storage corruption

**Risk:** Malformed local data breaks the game.

**Mitigation:** Validate persisted data and fall back to safe defaults.

### Timing test instability

**Risk:** Playback tests become flaky.

**Mitigation:** Centralise timers and use fake timers in tests.

## 20. Future Opportunities

Potential later additions:

- mixed-category sequences;
- daily challenges;
- timed recall mode;
- custom card decks;
- cloud accounts and synchronisation;
- global or friends leaderboards;
- multiplayer challenges;
- achievements;
- progressive web app installation;
- optional difficulty controls;
- audio sequences;
- educational vocabulary or language decks.

These are not part of the MVP.

## 21. Delivery Milestones

### Milestone 1: Foundation

- Vite and React setup;
- Tailwind configuration;
- test setup;
- card-set definitions;
- game-state model.

### Milestone 2: Core domain

- sequence generation;
- duplicate rules;
- scoring;
- validation;
- reducer transitions;
- unit tests.

### Milestone 3: Gameplay UI

- category selection;
- playback;
- recall slots;
- shuffled grid;
- undo and submit;
- feedback;
- game over.

### Milestone 4: Persistence and accessibility

- local storage;
- settings;
- keyboard support;
- live announcements;
- reduced motion;
- responsive refinement.

### Milestone 5: Validation

- complete test suite;
- cross-device checks;
- accessibility review;
- production build verification.

## 22. Definition of Done

The MVP is complete when:

- all acceptance criteria pass;
- production build succeeds;
- automated tests pass;
- gameplay works on mobile and desktop;
- keyboard-only play is supported;
- local persistence is resilient;
- no backend is required;
- the README documents setup, scripts, game rules, and project scope;
- no medical or therapeutic claims appear in the product.
