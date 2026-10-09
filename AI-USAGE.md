# AI Usage — BingeLog

This project used ChatGPT for planning, DeepSeek for coding and
implementation assistance, and Claude (chat and Claude Code) for guidance,
deployment help, one piece of server code, and the later client work in
entries 8 to 15 (theme, episode input, status rules, search, login screen,
deploy config, revised status rules, total-field investigation). None of the tools wrote the whole project — see
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

### 8. Oct 2026 (worked 2026-10-02) — Claude Code (Sonnet 5.5) — Dark theme, sticky header, cover fallback
**Asked:** Make the header sticky, make the site dark grey, and show the
show's title instead of the first letter when there is no cover (and get rid
of the "600 x 900" demo images).
**Produced:** New palette values in `global.css`, a new `--color-on-primary`
token (dark text on the lighter indigo and on the amber button), dark
replacements for the hard-coded light colours in `Button`/`Badge`/`ShowCard`,
`position: sticky` on the header, title text in Playfair Display (Google Fonts
link in `index.html`) in the cover placeholders, `null` instead of
`placehold.co` covers in `seed.json`, `mockApi.js` and `seed.sql`.
**Checked:** `vite build` passes, and Claude computed the contrast ratios of
the new colour pairs with a script. Claude did not look at it in a browser.
**Known mismatch:** the M6A3 design system still describes the light palette
and a single system font; the docs were not updated with this change.
**Commit:** `20ea72e` — https://github.com/JCalaguas/Bingelog/commit/20ea72e

### 9. Oct 2026 (worked 2026-10-05) — Claude Code (Sonnet 5.5) — Typed episode input and total-episodes field
**Asked:** Let the user type the current episode, not only use -/+; later,
add a way to edit total episodes on Show Detail.
**Produced:** A rewrite of `EpisodeStepper.jsx`/`.module.css` (typed input,
applied on blur or Enter, capped at the total, non-numbers reverted) and a new
`TotalEpisodesField.jsx` wired into `ShowDetailPanel.jsx` (blank = unknown
total, invalid values show an error and are not applied).
**Checked:** `vite build` passes. No automated tests; the behaviour was
reasoned through, not run.
**Note:** this changes a component I wrote myself — see "Who wrote what".
**Commit:** `38575e8` — https://github.com/JCalaguas/Bingelog/commit/38575e8

### 10. Oct 2026 (worked between 2026-10-05 and 2026-10-09) — Claude Code (Sonnet 5.5) — Status follows episode progress
**Asked:** Status should follow the episode: 0 = Plan to Watch, in between =
Watching, equal to the total = Finished; Finished should set the episode to
the total (1 when the total is unknown) and follow the total when it changes.
**Produced:** `statusFromProgress()` in `constants.js`, the status/episode
rules in `ShowDetailPage.jsx`, and the matching starting episode in
`AddShowPage.jsx` (Plan to Watch 0, Watching 1, Finished total or 1).
**Limits:** client-side only. The server and `mockApi.js` do not enforce
these rules, so calling the API directly can still save a Finished show at
episode 0.
**Checked:** `vite build` passes. Not run in a browser by Claude.
**Superseded:** the "Finished with no total saves at episode 1" behaviour in
this entry was replaced by entry 14 (a show with no total can never be
Finished).
**Commit:** `7fa9363` — https://github.com/JCalaguas/Bingelog/commit/7fa9363

### 11. Oct 2026 (worked 2026-10-02) — Claude Code (Sonnet 5.5) — Library search
**Asked:** A search bar for the library.
**Produced:** `LibrarySearch.jsx`/`.module.css` and the filtering in
`LibraryPage.jsx` (case-insensitive title match on the loaded list, works
together with the status filter, "No matches" empty state, Clear button).
**Checked:** `vite build` passes. Not run in a browser by Claude.
**Commit:** `66596f6` — https://github.com/JCalaguas/Bingelog/commit/66596f6

### 12. Oct 2026 (worked 2026-10-04) — Claude Code (Sonnet 5.5) — Login screen for real mode
**Asked:** Add a login screen so the Pages-hosted client can use the
Basic-Auth-protected API, with: sessionStorage not localStorage, shown only in
real mode, the password checked with a real request before unlocking, and the
password never in a `VITE_` variable or logged.
**Produced:** `authApi` in `httpApi.js`/`mockApi.js`/`index.js`,
`useLoggedIn.js`, `LoginPage.jsx`, the gate in `App.jsx`, and a Log out button
in `Header.jsx`.
**Checked:** `vite build` passes in both modes. Claude tested the login logic
against a throwaway local server that required a password (wrong password
gave 401 and stored nothing; right password unlocked; logout cleared it). It
was not tested against the deployed Render API by Claude.
**Commit:** `83b5fdd` — https://github.com/JCalaguas/Bingelog/commit/83b5fdd

### 13. Oct 2026 (worked 2026-10-09) — Claude Code (Sonnet 5.5) — Deploy config for a second (Vercel) copy
**Asked:** Check how the build sets `base`, make a plain `npm run build` use
`/` while the Pages workflow keeps `/Bingelog/`, and add a Vercel SPA rewrite.
**Produced:** `client/vercel.json`. No change was needed to `vite.config.js`
or the workflow: `base` already defaults to `/` and the workflow already sets
`VITE_BASE_PATH`. Claude built both ways and checked the asset paths
(`/assets/...` and `/Bingelog/assets/...`).
**Not done:** the Vercel deployment itself.
**Commit:** `c3e4177` — https://github.com/JCalaguas/Bingelog/commit/c3e4177

### 14. Oct 2026 (worked 2026-10-09) — Claude Code (Sonnet 5.5) — A show with no total can never be Finished
**Asked:** Change the status rules: with no total, Plan to Watch at episode 0
and Watching otherwise, and the Finished option disabled with the hint "Set
total episodes first" (Show Detail and Add Show); with a total, the old rule;
clearing the total on a Finished show makes it Watching and keeps the episode;
and "Finished means episode = total" applied whenever a show loads or saves
with a known total, so a row like Hunter x Hunter (Finished, 0 of 148) shows
148 / 148.
**Produced:** `normalizeShow()` in `constants.js` (used when the Library and
Show Detail load a show, and before Show Detail saves), disabled-option support
in `Select.jsx`, a `hint` prop on `FormField.jsx`, and the rule changes in
`ShowDetailPage.jsx`, `AddShowPage.jsx`, `AddShowForm.jsx` and
`ShowDetailPanel.jsx`. This replaces the "Finished with no total saves at
episode 1" behaviour from entry 10.
**Checked:** `vite build` passes, and the behaviour was run in headless Chrome
against demo mode: legacy rows (Finished 0 of 148, Finished with no total)
display as 148 / 148 and Plan to Watch in the Library, opening and saving the
first one stores 148; Finished is disabled with the hint when there is no
total; clearing the total on a Finished show gives Watching with the episode
kept; Add Show disables Finished until a total is entered and drops it when
the total is cleared.
**Limits:** client-side only, so the server and `mockApi.js` still accept the
old states if the API is called directly, and the Library repairs only how an
old row is displayed, not the stored row, until that show is opened and saved.
Not tested against the deployed Render API.
**Commit:** `a2c8121` — https://github.com/JCalaguas/Bingelog/commit/a2c8121

### 15. Oct 2026 (worked 2026-10-09) — Claude Code (Sonnet 5.5) — Investigating "can't edit total episodes"
**Asked:** Find out why the Total episodes field on Show Detail could not be
edited, on localhost and on the Vercel deploy, and fix it.
**What I (Claude) found:** the field is the one Claude Code wrote in entry 9.
I could not reproduce a failure. It is imported and rendered (no condition
hides it, and it is not disabled or read-only), typing works, the value is
applied on blur and on Enter, and Save sends `totalEpisodes` in the PUT. I ran
this in headless Chrome against demo mode, and against real mode with the
actual `server/server.js` and `showsRepo.js` code running on an in-memory
Postgres stand-in (`pg-mem`): the PUT returned 200 and the new total was
stored, for an ongoing show, a Watching show and a Finished show.
**Produced:** only a hint under the field, "Press Enter or click away to apply,
then Save." The field applies on blur/Enter and nothing else on the page
visibly changes while typing, which is the most likely thing that looked like
"can't edit". This is a guess at the cause, not a confirmed fix.
**Not covered:** the deployed Render API and the live Vercel/localhost pages
were not tested by Claude. If it still fails there, the browser console error
and the PUT request/response from the Network tab are needed.
**Commit:** `0d0e3aa` — https://github.com/JCalaguas/Bingelog/commit/0d0e3aa

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

### 4. Add Show saved "Finished" shows at episode 0, and Show Detail had no total field (found Oct 2026)
**What happened:** The Add Show form (generated in entry 5) never sent a
`currentEpisode`, so the server defaulted it to 0 and a show added as
"Finished" was stored as Finished at episode 0. Show Detail also had no field
to edit total episodes, so a wrong or missing total from TVMaze could not be
corrected.
**How I found it:** by testing the app, not caught by the AI.
**Fix:** Claude Code added the total field and the status/episode rules
(entries 9 and 10). The rules are client-side only, so the same bad state is
still possible through direct API calls.
**Commits:** `38575e8`, `7fa9363`

## Who wrote what

**`client/src/components/EpisodeStepper.jsx` and
`EpisodeStepper.module.css`** — originally written by me, not DeepSeek, then
partly rewritten by Claude Code on 2026-10-05 (commit `38575e8`). The `-`/`+`
buttons and the limit logic (`value > 0`, and the `total == null` check)
are my original code and are kept. Claude Code added the typed number input
(a text draft that is applied on blur or Enter, capped at the total, with
non-digits reverted), a `useEffect` that keeps the draft in sync with the real
value, the `/ total` label, the proper `−` sign, and the input styles. It also
dropped my explanatory code comments when it rewrote the file. So the
component is now a mix, and the explanation below describes my original
version only.

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
**Commits (original version):** `dea3e7c` (component logic), `bc7581a` (styles — I forgot to
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