# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

- **ESLint**: Use `typescript-eslint` flat config (`tseslint.config(...tseslint.configs.recommended)`). Set both `argsIgnorePattern` and `varsIgnorePattern` to `"^_"`. Do NOT use `FlatCompat` or `eslint-config-next` — incompatible with ESLint 10.
- **Path alias**: `@/` maps to `src/` (tsconfig + vitest both configured).
- **DB client**: `src/db/index.ts` exports `db` (Drizzle over Neon HTTP).
- **Tests**: Vitest with jsdom, setup at `src/__tests__/setup.ts`. For `vi.mock` factories: never reference module-level `const` variables inside — import after all mocks and use `vi.mocked(...)`. Mock `server-only` in every test that imports a module that imports it.
- **tldraw v5**: Module augmentation: `declare module "tldraw"`. Use `getIndicatorPath` (not `indicator`). `editor.getSnapshot()`. Arrows use `TLArrowBinding` records (`fromId`=arrow, `toId`=shape, `terminal`='start'|'end').
- **Next.js 16 dynamic**: `ssr: false` must be in a `"use client"` component — create a wrapper.
- **AI SDK v6**: `.toTextStreamResponse()` (not `.toDataStreamResponse()`). `maxOutputTokens` (not `maxTokens`).
- **Better Auth**: Needs `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL`. Warns but builds fine without them.

---

## [arch-btw-aw5] Project scaffold
- Fixed ESLint config (FlatCompat + eslint-plugin-react@7 incompatible with ESLint 10). Replaced with typescript-eslint flat config.
- All checks: typecheck ✓ lint ✓ build ✓ test ✓

## [arch-btw-ljz] Better Auth + GitHub OAuth + session
- `src/lib/auth.ts` (server-only), `src/lib/auth-client.ts`, route handler `/api/auth/[...all]`.
- Drizzle schema: user, session, account, verification. Migration applied to Neon (verified via MCP: 4 tables present).
- Tests: 3 auth session tests (mocked).

## [arch-btw-10z] Data model
- Drizzle `attempt` table with all required columns. Migration applied (5 tables in Neon).
- Zod `scorecardSchema` at `src/types/scorecard.ts`. `Problem` type at `src/types/problem.ts`. Seed problem: url-shortener.
- Tests: 5 scorecard tests + 2 problem structure tests.

## [arch-btw-a5q] LLM provider layer
- `src/lib/llm.ts` — `getProvider()` selects Gemini > Anthropic > OpenAI. Throws clearly if no key. Empty string treated as absent.
- Tests: 7 tests covering all selection cases.

## [arch-btw-41o] Canvas + [arch-btw-yad] Serialization adapter
- tldraw 5.1.1. Single `ComponentShapeUtil` (13 types). `DesignCanvas`, `ComponentPalette`, `NotesPanel`. `/canvas` route via `CanvasClientWrapper`.
- `src/lib/serialize.ts` — `serializeDesign()` reads TLArrowBinding records for edges.
- Tests: 9 serialization tests.

## [arch-btw-11u] Review loop + [arch-btw-uy5] Debrief
- `POST /api/review` — streams with system prompt including hidden rubric. Hard cap 10 turns, soft wind-down at turn 5.
- `POST /api/debrief` — generateObject with Zod scorecard, persists attempt.
- `ReviewThread` and `DebriefPanel` UI components.
- Tests: 8 review + 7 debrief tests.

## [arch-btw-0es] Seed problems + [arch-btw-w1b] Clarification beat + [arch-btw-aj0] Progress view
- 6 total problems (2 easy, 2 medium, 2 hard): url-shortener, notification-service, rate-limiter, webhook-delivery, collaborative-editor, ml-feature-pipeline.
- `POST /api/clarify` — keyword-matches to canned facts, returns in-character answer.
- `/progress` server component — lists user attempts with verdicts and rubric ratings.
- Tests: 8 problem tests + 4 clarify tests.

## [arch-btw-924] Deploy wiring
- `vercel.json` (lhr1 region). `.env.example` updated with all keys + comments. `BETTER_AUTH_URL` wired into auth config.
- Deployment ready: add BETTER_AUTH_SECRET, GITHUB_CLIENT_ID/SECRET, one LLM key in Vercel project settings, then `vercel --prod`.

---

## Final State: 50/50 tests passing | typecheck ✓ | lint ✓ | build ✓ | all 12 tasks closed
