# arch-btw — Project Context

> **This file is the durable, git-portable source of truth for project decisions.**
> Mempalace is a *derived* semantic index over it. On a new machine, run
> `mempalace mine .` to rebuild the local palace from this file (the global
> ChromaDB palace at `~/.mempalace/palace` does **not** travel with the repo).
> Keep this file updated as decisions change — it is what survives a clone.

## What this is

A **single-player portfolio + personal learning tool** for practising system
design. You drag prefab infrastructure components onto an infinite canvas,
connect them with directed arrows, explain each one, then defend your design in
a **turn-based PR-review loop** with an LLM that behaves like a London-startup
senior engineer / hiring manager (not FAANG-algorithmic). It ends in a
structured scorecard debrief.

Not multi-tenant, no payments, no strangers. The entire complexity budget goes
into critique quality and canvas feel.

## Core loop

1. Pick a problem (6 curated, 2 easy / 2 medium / 2 hard, all available from the start).
2. Optionally ask clarifying questions — the interviewer answers from the problem's canned facts.
3. Design on a **tldraw** canvas: drag prefab boxes, connect with directed arrows,
   optionally explain each box, keep a design-level "train of thought" notes section.
4. **Turn-based review loop** (chess-turn / PR-review metaphor): press **"Request review"**
   → reviewer probes weak/unexplained spots → you edit the diagram and/or type a reply
   → press the button to **re-review** → repeat.
5. Press **"Finish & get verdict"** → structured debrief.

Per-turn output = conversational review comments. Final output = structured
scorecard. The user controls when the interview ends; soft wind-down ~5–7 turns,
hard cap ~10 to bound API cost.

## Key design decisions (interview-grilled 2026-06-24)

| Topic | Decision |
|---|---|
| Audience | Portfolio piece **and** personal learning tool, equally. |
| Evaluation | Hybrid grounding: hidden per-problem **rubric + reference** keep the LLM sharp/consistent, but weird-but-valid designs still pass. Judges *how you think and justify*, not blueprint-matching. |
| Interaction | Interactive interview ending in a verdict; **turn-based** (not live chat). |
| Components | ~12 prefab box types + a Custom box. Each box has an **optional** explanation field — an empty field is meaningful signal the reviewer can probe. No typed property schemas. |
| Palette | Service/API, Worker, Queue/Stream, SQL DB, NoSQL, Cache, Object storage, Gateway/LB, Third-party API, LLM provider, Webhook source, Cron, + Custom. |
| Problem model | id, title, difficulty, tags, prompt (vague), canned clarification facts, hidden rubric, hidden reference. Reference **revealed in the debrief** as "one strong approach". |
| Problem storage | LLM-drafted + human-curated, stored as **static server-only TS files** so rubric/reference never reach the browser. |
| Serialization | tldraw store → clean `{ nodes, edges, notes }` JSON via a deliberately-tested adapter (first-class module). Directed arrows. Full snapshot re-sent each turn. Store **both** the tldraw snapshot (reload/edit) and the derived graph JSON (LLM input + record). |
| Canvas library | **tldraw** (chosen over React Flow). Consequence: we own custom ShapeUtils per component type + the store→graph extraction adapter. |
| Debrief | `generateObject` + Zod scorecard: per-rubric ratings + comments, one-line verdict (advance / borderline / not yet), 2–3 transcript callbacks, expandable revealed reference. Kept tight. |
| LLM | Vercel AI SDK, swappable across **exactly** Gemini / Anthropic / OpenAI, selected by whichever of `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` is present. All calls server-side. `streamText` for review turns, `generateObject` for the debrief. Strong reasoning model default. |
| Auth | **Better Auth** + GitHub OAuth (Auth.js rejected as finicky). |
| Database | **Neon Postgres + Drizzle** (over Prisma / Turso). Attempts table stores tldraw snapshot + graph JSON + transcript + scorecard + verdict + userId + problemId + createdAt. |
| Type spine | Drizzle (DB) + Zod (scorecard, shared by AI SDK / DB JSON column / React render) + static typed problem files. One source of truth per concern. |
| Stack | Next.js App Router (latest stable, React 19) + TS strict, Route Handlers for AI SDK streaming, Tailwind + shadcn/ui, hosted on Vercel. |

### Out of scope for v1

Voice chat (parked as future), runtime problem generation, multi-tenancy,
payments, typed component property schemas.

## Work breakdown

Tracked in **beads** (`bd ready` to find the next unblocked issue). Epic:
`arch-btw-2bq`. Build order: project scaffold → (auth / data model / canvas /
LLM provider layer) → serialization adapter → turn-based review loop →
debrief → progress view + deploy.

## Observed owner preferences

Spec-driven, TypeScript-fluent, pragmatic about scope, prefers honest critical
feedback over agreement. Dislikes Auth.js; likes Better Auth and tldraw.
