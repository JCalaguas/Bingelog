# AI Usage — BingeLog

This project used ChatGPT for planning, DeepSeek for coding and
implementation assistance, and Claude (chat and Claude Code) for guidance,
deployment help and one piece of server code. Neither tool wrote the whole project — see
"Who wrote what" below for exactly which parts are mine.

## How I used AI

### 1. 2026-09-23 — DeepSeek — Backend foundation
**Asked:** Set up Express + PostgreSQL connection, create the `shows`
table schema, and scaffold the server structure.
**Produced:** `server/app.js`, `server/db.js`, `database/schema.sql`,
initial `database/setup.js`.
**Kept:** The schema and connection setup, largely as generated.
**Changed:** Nothing major at this stage.
**Commit:** local repo `8e47790`, `9916870` (this early local repo was
never pushed publicly — see note at the end of this file).

### 2. 2026-09-23 — DeepSeek — Shows REST endpoints
**Asked:** Add `GET /api/shows`, `GET /api/shows/:id`, `POST /api/shows`
with server-side validation and parameterized queries.
**Produced:** `server/routes/shows.js`.
**Kept:** The route structure and parameterized query pattern.
**Changed:** Found a validation bug while testing (see "Where the AI got
it wrong" below) and had DeepSeek fix it.
**Commit:** local repo `6f39017`, fix in `07ba2be`.

### 3. 2026-09-28 — DeepSeek — Port backend into course template
**Asked:** Port the working backend (schema, queries, TVMaze proxy) from
the local repo into the `HAU-6APSI/final-project-template` structure,
adding `PUT`/`DELETE` and TVMaze search endpoints that hadn't existed yet.
**Produced:** `server/showsRepo.js`, `server/tvmaze.js`, updated
`server/server.js`, `server/db/schema.sql`, `server/db/seed.sql`.
**Kept:** The overall structure, the parameterized queries, the TVMaze
timeout handling.
**Changed:** Fixed a bug in the `PUT` handler (below) before accepting it.
**Commit:** `935affa`, `2048d34`, `d6f93c0`.

### 4. 2026-09-28 — DeepSeek — Client API layer
**Asked:** Build `client/src/api/index.js`, `httpApi.js`, `mockApi.js` and
`seed.json`, matching the template's demo-mode/real-mode switch, with both
implementations sharing the same function names and error shape.
**Produced:** All four files, including a small hardcoded fake-TVMaze
catalog for demo-mode search.
**Kept:** Nearly all of it, including the decision to mirror the server's
merge-on-update logic in the mock implementation.
**Changed:** Nothing at this stage — verified with `node --check` and a
later browser test.
**Commit:** `48e57cc`.

### 5. 2026-09-28 — DeepSeek — Client components, pages and routing
**Asked:** Port the planned component tree (atoms/molecules/organisms),
the three pages, and React Router with a GitHub Pages–compatible basename,
using the M6A3 design tokens.
**Produced:** ~50 files across `client/src/components/`, `client/src/pages/`,
routing in `App.jsx`/`main.jsx`, and `client/src/styles/global.css`.
**Kept:** Almost all of it — the component structure follows the M6A2
breakdown closely.
**Changed:** Found and fixed a bug after this was accepted (see below).
**Commit:** `fd201f1`, `9a50496`.

### 6. 2026-09-28 — DeepSeek — TVMaze episode-count lookup
**Asked:** Implement the "fetch total episodes only after a search result
is selected" behavior agreed on beforehand — a follow-up call to
`shows/:id/episodes`, counting episodes only for shows with TVMaze status
"Ended", `null` otherwise.
**Produced:** `server/tvmaze.js`.
**Kept:** As generated — matches the design decision exactly and was
verified with `curl` against a known ended show (Naruto, externalId 495 →
220 episodes).
**Changed:** Nothing.
**Commit:** `2048d34`.

### 7. 2026-10-01 — Claude Code — Basic Auth access gate
**Asked:** Add an access gate in front of the deployed API so it is not open
to the internet, and set up Render and Neon hosting with me step by step.
**Produced:** A Basic Auth middleware in `server/server.js` (credentials
from `AUTH_USER`/`AUTH_PASS`, compared with `timingSafeEqual`, `/healthz`
and `/readyz` left open, production refuses to boot without them) and the
matching placeholders in `server/.env.example`.
**Kept:** All of it as written. I tested it locally with `curl` (no
credentials 401, wrong password 401, `/healthz` 200) and on the deployed
service, where `/api/shows` now asks for a login.
**Changed:** Nothing. Claude suggested I write it myself for the 20% rule; I chose to
have Claude write it, so it counts as AI-written code, not mine.
**Commit:** `403bcfb` — https://github.com/JCalaguas/Bingelog/commit/403bcfb

## Where the AI got it wrong

### 1. NaN validation bug (found 2026-09-23)
**What happened:** The rating validation used a comparison like
`rating < 1 || rating > 5` on a value that hadn't been checked for being a
real number first. A non-numeric rating (e.g. a string) produced `NaN`,
and every comparison with `NaN` is `false` — so the invalid value passed
validation instead of being rejected.
**How I found it:** I found it myself while testing the POST endpoint
with bad input, not something DeepSeek caught on its own.
**Fix:** DeepSeek added a proper integer check (`Number.isInteger`) before
the range comparison.
**Commit:** local repo `07ba2be` — this repo was never pushed publicly
(see note below), so this commit has no public link. The before/after
logic is described above from memory of the actual change.

### 2. PUT overwrote omitted fields with null (found 2026-09-28)
**What happened:** The first version of `PUT /api/shows/:id` validated
and saved the request body directly, with no merge against the existing
row. Sending a partial update (e.g. just `{"status": "Finished"}`) wiped
every field the request didn't include — `coverUrl` and `externalId`
specifically got set to `null`.
**How I found it:** I found it myself by comparing a show's `curl` output
before and after a partial `PUT`, and noticed `coverUrl`/`externalId` had
been nulled even though I never touched them.
**Fix:** DeepSeek changed the handler to load the existing row, merge the
request body over it using `!== undefined` (not `??`, so an explicit
`null` can still intentionally clear a field like rating), validate the
merged result, then save.
**Commit:** `d6f93c0` — https://github.com/JCalaguas/Bingelog/commit/d6f93c0

### 3. Show Detail page crashed on load (white screen, found 2026-09-28)
**What happened:** `ShowDetailPage.jsx` initialized an error-tracking
state as `null` and passed it straight to `ShowDetailPanel` as the
`errors` prop. The panel declared `errors = {}` as a default parameter,
but default parameters only apply to `undefined`, not `null` — so on
first render it tried to read `errors.form` on `null` and crashed, which
React showed as a blank white page.
**How I found it:** I noticed the white screen while clicking through the
app and reported it; I diagnosed the exact cause with AI help reading the
console error, and applied the one-line fix myself.
**Fix:** Changed `errors={saveError}` to `errors={saveError ?? {}}` in
`ShowDetailPage.jsx`.
**Commit:** `54f227b` — https://github.com/JCalaguas/Bingelog/commit/54f227b

## Who wrote what

**`client/src/components/EpisodeStepper.jsx` and
`EpisodeStepper.module.css`** — written by me, not DeepSeek.

In my own words: this component shows the current episode number with
`-`/`+` buttons. It's a controlled component — it holds no state of its
own, it just receives `value`, `total` and an `onChange` callback from its
parent (`ShowDetailPanel`) and calls `onChange` with the new number. The
tricky part was that `total` can be `null` for an ongoing show with no
known episode count, so the decrement button is disabled at 0
(`value > 0`), but the increment button only compares against `total`
when `total` isn't `null` — otherwise it would try to compare a number
against `null`, which doesn't mean what you'd expect. I used
`total == null` (loose equality, so it also catches `undefined`) to short
circuit that comparison before it happens.
**Commits:** `dea3e7c` (component logic), `bc7581a` (styles — I forgot to
save the CSS file before the first commit, so it went in empty; this
commit added the actual styles), `9aa9391` (small follow-up: added
`color`/`border-radius` from the design tokens).

**AI-written piece explained in my own words — the `PUT` merge fix
(`server/server.js`, commit `d6f93c0`):** DeepSeek's fix loads the
existing show from the database, then builds a merged object where each
field checks `body.field !== undefined ? body.field : current.field`.
The reason it's `!== undefined` and not `??` (nullish coalescing) matters:
`??` treats both a missing field and an explicit `null` the same way — it
falls back to the old value either way. But `null` can be a real,
intentional value here — for example, clearing a show's rating by sending
`{"rating": null}`. If the merge used `??`, you could never un-rate a
show through a partial update, because the `null` would just be ignored
and the old rating would come back. `!== undefined` only falls back when
the field was left out of the request entirely, so an explicit `null`
still gets through and clears the field.

## A note on the local (Week 1) repository

The backend foundation described in entries 1–2 above was originally built
in a separate local git repository before the course's official template
existed for this project. That repository's six commits (23 Sep 2026) were
never pushed to GitHub — they exist only on my own machine — because I
later discovered they were authored with my personal email address before
I understood the "no personal info in the public repo" rule, and by the
time I caught it, the project had already moved into this repository
(created from the official template). Rather than rewrite that history
after the fact, I ported the working code itself into this repository on
28 Sep (see entry 3), which is why this repo's commit history starts
fresh on that date even though the backend's actual design and first
working version are a few days older. The local repo's commits are
referenced above by hash for accuracy, but cannot be linked publicly.