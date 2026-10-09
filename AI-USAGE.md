# AI Usage — BingeLog

This project used ChatGPT for planning, DeepSeek for coding and
implementation assistance, and Claude (chat and Claude Code) for guidance,
deployment help, one piece of server code, and the later client work in
entries 8 to 16 (theme, episode input, status rules, search, login screen,
deploy config, revised status rules, total-field investigation, docs). Entry 17 covers server changes I wrote with Claude's help (the rate-limiter configuration was adapted from a Claude snippet), and entry 18 is a small CSS change Claude Code wrote. None of the tools wrote the whole project — see
"Who wrote what" below for exactly which parts are mine.

## ChatGPT (planning only)

*This is my wording from 28 September 2026, moved here unchanged from the
workspace copy of this file.*

ChatGPT was used for project planning only:

- comparing project ideas and choosing BingeLog
- proposal planning (`BingeLog-M6A1-Proposal.md`)
- wireframe planning (`m6a2/BingeLog-M6A2-Wireframes.*`)
- design-system planning (`m6a3/BingeLog-M6A3-Design-System.*`)
- implementation planning and review

ChatGPT did not write the application code.

## How I used AI

### 1. 2026-09-23 — DeepSeek — Backend foundation
**Asked:** Set up Express + PostgreSQL connection, create the `shows`
table schema, and scaffold the server structure.
**Produced:** `server/app.js`, `server/db.js`, `database/schema.sql`,
initial `database/setup.js`, and the early `package.json`, `.gitignore` and
`.env.example`.
**Kept:** The schema and connection setup, largely as generated.
**Changed:** Nothing major at this stage.
**Commit:** local repo `cd52939` (`package.json`, `.gitignore`,
`.env.example`), `8e47790`, `9916870` — early local repo, not pushed, no link
available (see the note at the end of this file).

### 2. 2026-09-23 — DeepSeek — Shows REST endpoints
**Asked:** Add `GET /api/shows`, `GET /api/shows/:id`, `POST /api/shows`
with server-side validation and parameterized queries.
**Produced:** `server/routes/shows.js`.
**Kept:** The route structure and parameterized query pattern.
**Changed:** Found a validation bug while testing (see "Where the AI got
it wrong" below) and had DeepSeek fix it.
**Commit:** local repo `6f39017`, fix in `07ba2be` — early local repo, not
pushed, no link available.

### 3. 2026-09-28 — DeepSeek — Port backend into course template
**Asked:** Port the working backend (schema, queries, TVMaze proxy) from
the local repo into the `HAU-6APSI/final-project-template` structure,
adding `PUT`/`DELETE` and TVMaze search endpoints that hadn't existed yet.
**Produced:** `server/showsRepo.js`, `server/tvmaze.js`, updated
`server/server.js`, `server/db/schema.sql`, `server/db/seed.sql`.
**Kept:** The overall structure, the parameterized queries, the TVMaze
timeout handling.
**Changed:** Fixed a bug in the `PUT` handler (below) before accepting it.
**Commits:** `935affa` — https://github.com/JCalaguas/Bingelog/commit/935affa, `2048d34` — https://github.com/JCalaguas/Bingelog/commit/2048d34, `d6f93c0` — https://github.com/JCalaguas/Bingelog/commit/d6f93c0

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
**Commit:** `48e57cc` — https://github.com/JCalaguas/Bingelog/commit/48e57cc

### 5. 2026-09-28 — DeepSeek — Client components, pages and routing
**Asked:** Port the planned component tree (atoms/molecules/organisms),
the three pages, and React Router with a GitHub Pages–compatible basename,
using the M6A3 design tokens.
**Produced:** ~50 files across `client/src/components/`, `client/src/pages/`,
routing in `App.jsx`/`main.jsx`, and `client/src/styles/global.css`.
**Kept:** Almost all of it — the component structure follows the M6A2
breakdown closely.
**Changed:** Found and fixed a bug after this was accepted (see below).
**Commits:** `fd201f1` — https://github.com/JCalaguas/Bingelog/commit/fd201f1, `9a50496` — https://github.com/JCalaguas/Bingelog/commit/9a50496

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
**Commit:** `2048d34` — https://github.com/JCalaguas/Bingelog/commit/2048d34

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

### 9. Oct 2026 (episode input 2026-10-05; total field between 2026-10-05 and 2026-10-09) — Claude Code (Sonnet 5.5) — Typed episode input and total-episodes field
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
**Superseded by entry 14.** This is what commit `7fa9363` did when it was
made. The part about Finished with no total saving at episode 1 is no longer
how the app works: a show with no total can now never be Finished.
**Asked:** Status should follow the episode: 0 = Plan to Watch, in between =
Watching, equal to the total = Finished; Finished should set the episode to
the total (1 when the total is unknown) and follow the total when it changes.
**Produced:** `statusFromProgress()` in `constants.js`, the status/episode
rules in `ShowDetailPage.jsx`, and the matching starting episode in
`AddShowPage.jsx` (Plan to Watch 0, Watching 1, Finished total or 1).
**Limits at the time:** client-side only. That is no longer true of the
server: since commit `a35de20` (entry 17) the server enforces these rules too.
`mockApi.js` (demo mode) still does not.
**Checked:** `vite build` passes. Not run in a browser by Claude.
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
**Not done by Claude:** creating or testing the Vercel project itself.
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
**Limits at the time:** client-side only. Since commit `a35de20` (entry 17)
the server enforces these rules too; `mockApi.js` still does not. The Library
repairs only how an old row is displayed, not the stored row, until that show
is opened and saved. Not tested against the deployed Render API.
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

### 16. Oct 2026 (worked 2026-10-09) — Claude Code (Sonnet 5.5) — Docs: README, screenshots, security checklist, journal draft
**Asked:** Correct security-checklist rows 18, 21, 23 and 30; add a security
paragraph to the journal; make the README work for a stranger (Vercel link,
explain the login without publishing the password, replace the old
light-theme screenshots with current ones including real mode, check the setup
steps from a fresh clone).
**Produced:**
- **README** (commit `de593de`): the Vercel real-mode link, a "Logging in"
  section, the updated project structure, a Credits section (TVMaze,
  Playfair Display), updated known issues, and seven new screenshots taken by
  Claude with headless Chrome. The demo-mode screenshots use the invented demo
  data. The two real-mode screenshots were taken against a local copy of the
  API running on an in-memory database with the invented seed data, not
  against the deployed server, and the README says so.
- **Security checklist** (rows 18, 21, 23, 30 and its header, in the course
  workspace repo, commit `bcff955`): Claude wrote the new row text from what
  the code does. Claude did not test the live Vercel site or the deployed
  Render API, so statements about how those behave come from reading the code
  and from what I told it.
- **`journal/week-4.md`** (same workspace commit `bcff955`): **Claude wrote
  this draft** of the security paragraph, from the project's contents rather
  than from my own account of the week. I have since rewritten it in my own
  words (entry 19); the draft from this commit was not my writing.
- **This file:** corrections to entries 9, 10 and 13 (dates, the superseded
  note, and wording about Vercel) and this entry.
**Checked:** from a fresh clone of the GitHub repo, the client `npm ci` and
`npm run build` pass and the dev server answers in demo mode; the server
`npm ci` and a syntax check pass. Real PostgreSQL was not available, so
`createdb` and `npm run db:schema` were not run (the schema and seed SQL did
run on an in-memory stand-in). The new commits use the GitHub noreply
author address and no history was rewritten.
**Commits:** `de593de` — https://github.com/JCalaguas/Bingelog/commit/de593de
(workspace repo: `bcff955`)

### 17. Oct 2026 (worked 2026-10-09) — Claude (chat, a review note, and Claude Code) — Server hardening I wrote with Claude's help
**What this entry is:** the `server/server.js` hardening below. I typed and
integrated all of it myself, but part of it was adapted from Claude's output;
the section "Who wrote what in this change" says which parts. Claude Code (the
command-line tool) did not write any of the changes. It ran the tests under
"Checked".
**What the changes are:** `helmet()` and `trust proxy` set to 1; length limits
(title 200, notes 2000, cover URL 2048); the Finished rules in `validateShow()`
(a Finished show needs a known total, and its episode must equal the total);
a `currentEpisode` check that rejects NaN (from `"abc"` or `""`); and a login
rate limiter (20 failed attempts per IP per 15 minutes, mounted before the auth
check so a blocked IP gets 429 even with the correct password).
**Who wrote what in this change:**
- Adapted from a code snippet Claude gave me in chat: the rate limiter's
  configuration (the import, `windowMs`, `limit`, `standardHeaders`,
  `legacyHeaders`), its 429 handler, and the way a failed login calls the
  limiter and then sends the 401. The committed handler and 401 blocks closely
  follow that snippet. This file does not record how much of it I pasted and
  how much I retyped.
- From a review note, not from code: mounting the limiter before the auth
  check, and using `requestWasSuccessful` to count only 401 responses.
- Described to me in words only, and written by me: the length limits, the two
  Finished rules, `helmet` (pointed at the snippet already in
  `docs/06-security-and-privacy.md`), `trust proxy`, the
  `skipSuccessfulRequests` fix, and the `currentEpisode` NaN check.
**What the reviews caught (two rounds, two different versions of my file):**
- *Version 1* (limiter only on the failure path; `currentEpisode === undefined
  || < 0` check): after 20 wrong guesses the correct password still got a 200,
  and `currentEpisode: "abc"` became NaN and returned a 500. A test run by
  Claude Code and the review note both found this. An earlier Claude review had
  called the failure-path-only limiter "the correct pattern", which was wrong
  (see "Where the AI got it wrong").
- *Version 2* (my fix for version 1) introduced two new bugs. The
  `requestWasSuccessful` option did nothing without `skipSuccessfulRequests`:
  in `express-rate-limit` v8 it is only read when `skipSuccessfulRequests` or
  `skipFailedRequests` is on, so every request counted and nothing was ever
  refunded. And the `currentEpisode === undefined` guard had been dropped:
  `""` becomes `undefined`, and `Number.isNaN(undefined)` and `undefined < 0`
  are both false, so `""` slipped through.
- The committed version closes both families: `skipSuccessfulRequests: true`,
  and `currentEpisode === undefined || Number.isNaN(currentEpisode) ||
  currentEpisode < 0`.
**Checked (by Claude Code, 2026-10-09):** a copy of the committed `server.js`
run against an in-memory database with `AUTH_USER=test` and `AUTH_PASS=test`.
21 wrong passwords gave 20 × 401 then 429, and the correct password after that
gave 429; 30 sequential successful requests gave 30 × 200; one character over
each length limit gave 400 and the exact limits gave 201; `currentEpisode` of
`"abc"` and `""` gave 400; Finished with no total and Finished with a
mismatched episode gave 400, and Finished 12 of 12 gave 201 (then deleted); and
the real-mode client against it could log in, create, edit (including
notes-only and rating-only updates), change the total and delete.
**Not tested / limits:** the real Postgres database was not part of that test
run. After the deploy, a read-only check of the live API on 2026-10-09 showed
no stored row that breaks the Finished rule (for example Hunter x Hunter is
stored as 148 of 148); this does not say how any old row was fixed. The
counter is in memory and keyed by IP, so it resets on a restart and one
person's failed attempts block others behind the same address. `trust proxy`
of 1 is unverified against Render's real setup. `mockApi.js` (demo mode) does
not enforce the status rules. A direct API update to an old row that breaks the
rules is rejected until the row is repaired.
**Attribution:** the commit carries a `Co-Authored-By: Claude` line that Claude
Code added by default, and its body says "Written by me with Claude Code's
guidance and review". I decided to keep the line.
**Commit:** `a35de20` (committed 2026-10-09 18:49 +0800) — https://github.com/JCalaguas/Bingelog/commit/a35de20

### 18. Oct 2026 (worked 2026-10-09) — Claude Code (Sonnet 5.5) — Two-column Library on phones
**Asked:** On a 375px phone each Library card was so tall that one cover filled
the screen. Make a small CSS-only change so at least two shows are visible
without scrolling, without changing behaviour, and check 320px, 375px and
desktop in a real browser.
**Produced:** CSS only, written by Claude Code, in
`client/src/components/organisms/ShowList.module.css` (two columns below
768px, three from 768px as before, smaller gap) and
`client/src/components/molecules/ShowCard.module.css` (tighter card padding,
a smaller cover-fallback title on phones, `min-width: 0` and word wrapping so
long titles cannot push a card wider). No component or JavaScript changed.
**Checked (by Claude Code, headless Chrome against demo mode):** with seven
test shows including a very long title, at 320, 375, 768 and 1100px there was no
horizontal scroll, no text overflowing a card and no overlapping text. At
375px with the demo banner removed (which matches real mode), two shows are
fully visible without scrolling and the next row is peeking. At 320x568 the
tops of two cards are visible but no card is fully on screen. With the demo
banner showing on a phone, the banner alone pushes the cards below the fold.
Not looked at on a real phone, and not checked on the live Vercel site after
the deploy.
**Commit:** `1ab3cea` (committed 2026-10-09 19:26 +0800) — https://github.com/JCalaguas/Bingelog/commit/1ab3cea

### 19. Oct 2026 (worked 2026-10-09) — Claude Code (Sonnet 5.5) — Week 4 journal security paragraph: from a Claude outline to my own words
**What happened:** The security paragraph in my week 4 journal started as an
outline written by Claude Code (entry 16, workspace commit `bcff955`). That
draft was built from the project's contents, not from my own account of the
week, and it was marked as a draft. I then rewrote the paragraph in my own
words. The final paragraph is my writing, not Claude's. The only AI-written
text it came from was that outline.
**Also in this change:** my final "Personal contribution" text, below, replaces
the "to be completed" placeholder that the workspace copy of this file still
carried, and the "Earlier version of this file" section of the workspace copy
was deleted so both copies of this file are identical.
**Commits:** `7a5e8dd` (adds this entry and the Personal contribution section) — https://github.com/JCalaguas/Bingelog/commit/7a5e8dd. The journal rewrite is `f5fa648` in my private course workspace repository, so it has no public link.

### 20. Oct 2026 (worked 2026-10-09, entry written 21:20 +0800) — Claude (chat) and Claude Code (Sonnet 5.5) — Final presentation deck
**What this entry is:** the slide deck `BingeLog Final Presentation.pptx` and its
speaker notes. The deck file is not in this repository.
**Who did what:**
- **Claude (in chat)** generated the first version of the slides and the
  speaker script.
- **Claude Code** edited the .pptx file: text fixes on slides 3, 4, 6, 7 and 8,
  the slide 4 table header contrast (dark header row with light text), the font
  change to Georgia (headings) and Arial (everything else), the two live links
  on slide 6, and the speaker-note wording. It also removed placeholder
  `[CONFIRM]` text where I had given it the facts to use, and it rendered the
  slides to check that the text fits.
- **Me:** I reviewed the deck against the repo, corrected the claims about AI
  use and about security, and wrote my own name, section and contribution
  lines. The slide 8 "What I did" lines are my statements about my own work.
**Limits:** Claude Code could not check which of my "What I did" statements
are true; that is my responsibility. The slide 6 links were checked by Claude
Code to return HTTP 200 on 2026-10-09 earlier in the session, not at the moment
of the last deck edit. The deck was last rendered in PowerPoint on Windows after
the font change, and the edits were done with python-pptx on a copy of the
file, with the original kept as a backup.
**Commit:** `4c33e1c` (adds this entry; the deck file itself is not in this repository) — https://github.com/JCalaguas/Bingelog/commit/4c33e1c

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
**Commit:** local repo `07ba2be` — early local repo, not pushed, no link
available. The before/after
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
(entries 9, 10 and 14). The rules are client-side only, so the same bad
state is still possible through direct API calls.
**Commits:** `38575e8` — https://github.com/JCalaguas/Bingelog/commit/38575e8, `7fa9363` — https://github.com/JCalaguas/Bingelog/commit/7fa9363, `a2c8121` — https://github.com/JCalaguas/Bingelog/commit/a2c8121

### 5. A review called a limiter that let the right password through "the correct pattern" (found 2026-10-09)
**What happened:** In a first review of my rate limiter, Claude described the
failure-path-only pattern (the limiter is only called after a failed login) as
the correct one. It is not: after 20 wrong guesses the correct password still
returned a 200, so an attacker's right guess was never blocked.
**How it was found:** a later review note, and then a test run by Claude Code,
both showed the correct password getting through after the limit.
**Fix:** I mounted the limiter before the auth check and counted only 401
responses (entry 17).
**Commit:** `a35de20` — https://github.com/JCalaguas/Bingelog/commit/a35de20

## Who wrote what

### How much of the code is mine (measured, and below the target)

The course target is that at least a fifth (20 percent) of the project is code I
wrote myself. **My share is below that target.** I measured it on 2026-10-09
by counting lines in `client/src` and `server` (`.js`, `.jsx`, `.css`, `.html`;
no lockfiles, JSON, SQL or images), blank lines included, and using `git blame`
to see which lines still exist in my parts:

| Code I wrote, as it exists now | Lines |
|---|---|
| `client/src/components/EpisodeStepper.jsx` (my 30 surviving lines) | 30 |
| `client/src/components/EpisodeStepper.module.css` (my 37 surviving lines) | 37 |
| Server hardening in `server/server.js`, commit `a35de20` | 49 |
| **Total** | **116** |

- **Total app code:** 3,290 lines (2,764 in `client/src`, 526 in `server`).
- **My share:** 116 of 3,290 is **3.5 percent**.
- **Without the rate limiter block** (17 lines adapted from a Claude snippet):
  99 lines, about 3.0 percent.
- **Counting my original `EpisodeStepper` before Claude Code rewrote it**
  (57 + 37 lines) plus the 49 hardening lines: 143 lines, **4.3 percent**.

The rest of the code was written by DeepSeek or by Claude Code (entries 1 to 18
above say which). I am not claiming a bigger share than this. What I can show is
the parts I did write and that I can explain, below.

### 1. `EpisodeStepper` (my original component)

**Files:** `client/src/components/EpisodeStepper.jsx` and
`client/src/components/EpisodeStepper.module.css`.
**Commits (original version):** `dea3e7c` (component logic) — https://github.com/JCalaguas/Bingelog/commit/dea3e7c,
`bc7581a` (styles; I forgot to save the CSS file before the first commit, so it
went in empty and this commit added the actual styles) — https://github.com/JCalaguas/Bingelog/commit/bc7581a, and
`9aa9391` (small follow-up: `color` and `border-radius` from the design
tokens) — https://github.com/JCalaguas/Bingelog/commit/9aa9391.
**Who wrote what in it now:** originally written by me, not DeepSeek, then partly
rewritten by Claude Code on 2026-10-05 (commit `38575e8` — https://github.com/JCalaguas/Bingelog/commit/38575e8). The
`-`/`+` buttons and the limit logic (`value > 0`, and the `total == null`
check) are my original code and are kept. Claude Code added the typed number
input (a text draft that is applied on blur or Enter, capped at the total, with
non-digits reverted), a `useEffect` that keeps the draft in sync with the real
value, the `/ total` label, the proper `−` sign, and the input styles. It also
dropped my explanatory code comments when it rewrote the file.

In my own words (written 2026-10-09, recorded as I wrote it):

> The decrement is disabled when value is 0 because the episode count should not
> go below zero. For the increment, I check total == null first because some
> shows do not have a known total episode count. If the total is unknown, the
> user can keep increasing the episode count. If the total is known, the value
> cannot go higher than that total. I used == null because it checks for both
> null and undefined.

### 2. Server hardening in `server/server.js` (typed by me)

**Commit:** `a35de20` — https://github.com/JCalaguas/Bingelog/commit/a35de20. Entry 17 above has the full account,
including which part came from a Claude snippet and which bugs the reviews
caught.
**Which lines are which:** I typed all 49 lines. The rate limiter's
configuration and its 429 handler (about 17 lines) were adapted from a snippet
Claude gave me in chat. `helmet`, `trust proxy`, the length limits, the two
Finished rules and the `currentEpisode` NaN check were described to me in words
and written by me.

In my own words (written 2026-10-09, recorded as I wrote it):

**`helmet()`** (`app.use(helmet())`, line 27):

> helmet() adds security-related HTTP headers to the server's responses. These
> headers help protect the app from some common web attacks by telling browsers
> how to handle the responses. I placed it near the top so it applies to
> requests before they reach the routes, instead of having to add it to each
> route separately.

**Field length limits** (title 200, notes 2000, `coverUrl` 2048, in `validateShow()`):

> I added these limits to prevent users from sending unnecessarily long inputs
> that could take up too much space or cause problems with the API. I used 200
> characters for the title because show titles should be relatively short, 2000
> for notes because users may need more space to write their thoughts, and 2048
> for the cover URL because links can be longer than regular text. Each limit
> depends on how that field is supposed to be used.

**Rate limiter order and options** (`authLimiter`, `skipSuccessfulRequests`,
`requestWasSuccessful`):

> The rate limiter needs to come before the auth check so it can count login
> attempts before the server checks the password. Otherwise, failed attempts
> might not be counted properly. skipSuccessfulRequests: true means successful
> requests are not supposed to count toward the limit. The requestWasSuccessful
> function checks the response status and treats anything other than 401 as
> successful, so incorrect passwords count toward the limit while other
> responses do not.

### 3. The one AI-written piece I understand best: the `PUT` merge fix

**File:** `server/server.js`. **Commit:** `d6f93c0` — https://github.com/JCalaguas/Bingelog/commit/d6f93c0. DeepSeek wrote
this fix: it loads the existing show from the database and builds a merged
object where each field is `body.field !== undefined ? body.field :
current.field`.

In my own words (written 2026-10-09, recorded as I wrote it):

> I used body.field !== undefined ? body.field : current.field because I need to
> tell the difference between a field that was not included and a field that was
> intentionally set to null. If the field is missing, the existing value stays
> the same. If the field is explicitly null, it can clear the value, like
> removing a show's rating. Using ?? would treat both null and undefined as
> missing, so it would not allow me to clear the field that way.

## Personal contribution

I wrote the original `EpisodeStepper` component and typed and integrated the
server security improvements with Claude's guidance, including using a
Claude-provided snippet for the rate limiter configuration. I tested the login,
an incorrect password, and the add, delete, and edit-notes features on the
deployed site. I also set up the Vercel, Render, and Neon projects and their
environment variables. I decided that shows without a known total episode count
cannot be marked as Finished, and that the Library should display two columns
on phones. I also caught and fixed the Show Detail white-screen crash and the
PUT bug that was clearing `coverUrl` and `externalId` unexpectedly.

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