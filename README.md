# BingeLog

A personal tracker for anime and TV shows. Search for a title, import its
metadata, and keep track of your own progress, status, rating and notes —
without recommendations, social features, or accounts.

## Overview

BingeLog solves a simple problem: losing track of what episode you're on,
what you've finished, and what you thought of it. You search a show once
(via TVMaze), import its title, cover and total episode count, and from
then on BingeLog owns your progress, status, rating and notes. TVMaze is a
supporting feature, not the point of the app — if search fails or returns
nothing usable, you can still add a show manually.

## Setup and installation

### Prerequisites
- Node.js 20 or later
- PostgreSQL (running locally, or a connection string to a hosted instance)
- npm

### Get the code
```bash
git clone https://github.com/JCalaguas/Bingelog.git
cd Bingelog
```

### Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### Environment variables

**`server/.env`** (copy from `server/.env.example`):

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres:yourpassword@localhost:5432/bingelog` | Never commit a real value |
| `PORT` | `3000` | Optional, defaults to 3000 |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `NODE_ENV` | `production` | Set on the host. In production the server refuses to start without `AUTH_USER` and `AUTH_PASS` |
| `AUTH_USER` / `AUTH_PASS` | *(set on the host)* | HTTP Basic Auth login for every route except `/healthz` and `/readyz`. Leave both unset locally to skip the login |

**`client/.env`** (copy from `client/.env.example`):

| Variable | Example | Notes |
|---|---|---|
| `VITE_USE_MOCK_API` | `false` | Only the exact string `false` disables demo mode. Any other value (or leaving it unset) uses the browser-only mock backend. |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Only used when mock mode is off |

Real credentials are never committed. `.env` is gitignored in both `server/`
and `client/`; only `.env.example` files with placeholder values are tracked.

### Database setup
```bash
# create the database (name must match DATABASE_URL)
createdb bingelog

cd server
npm run db:schema   # creates the shows table
npm run db:seed     # inserts 6 invented sample shows
```

## How to run it

**Demo mode** (no database or API needed — runs entirely in the browser via `localStorage`):
```bash
cd client
npm run dev
```
Open `http://localhost:5173`. A banner at the top indicates demo mode.

**Real mode** (backed by PostgreSQL and live TVMaze search):
```bash
# terminal 1
cd server
npm run dev
# wait for: API listening on http://localhost:3000

# terminal 2 — first set VITE_USE_MOCK_API=false in client/.env
cd client
npm run dev
```
Open `http://localhost:5173`. The demo banner disappears once real mode is active.

**Logging in (real mode only).** In real mode the app shows a login screen
before anything else. The username and password are the `AUTH_USER` and
`AUTH_PASS` values set on the server (in the host's environment settings, or in
`server/.env` when you run it yourself). They are not in this repository. If
both are left unset on a local server, any username and password is accepted.
The app checks the login with a real request before it unlocks, keeps it in
`sessionStorage` only (it is gone when you close the tab), and never puts it in
the built JavaScript. A **Log out** button appears in the header. Demo mode has
no login.

**Live demo:** https://jcalaguas.github.io/Bingelog/ (GitHub Pages, demo mode only, browser `localStorage` data, no real backend)

**Live, real mode:** https://bingelog-nu.vercel.app (Vercel, talks to the deployed API below, so it asks for a login; the login is not published here)

**Deployed API:** https://bingelog-6un8.onrender.com — Express on Render (free tier, so the first request after idle takes ~30 seconds) with PostgreSQL on Neon. Every route except `/healthz` and `/readyz` is behind HTTP Basic Auth; the Pages demo does not call it, because anything in a `VITE_*` variable is public.

## Features and usage

1. **Library** (`/`) — browse your saved shows, filter by status (Plan to
   Watch / Watching / Finished), open a show, or start adding one.
2. **Add Show** (`/add`) — search TVMaze by title, select a result to import
   its cover and (for ended shows) total episode count, confirm or edit the
   details, and save. If search fails or returns nothing useful, switch to
   manual entry and fill in the title yourself — total episodes is optional, but
   a show with no total cannot be set to Finished (see Show Detail below).
3. **Show Detail** (`/show/:id`) — change the current episode with the
   −/+ buttons or by typing it (capped at the total, if known), edit the total
   episodes (blank = unknown), set a 1–5 rating, write notes, save your
   changes, or delete the show (with a confirmation prompt).

   **Status follows progress.** With a known total: 0 is Plan to Watch,
   anything in between is Watching, and the total is Finished (picking
   Finished sets the episode to the total, and a Finished show's episode
   follows the total if it changes). With no total, a show is Plan to Watch at
   episode 0 and Watching otherwise; the Finished option is disabled with
   "Set total episodes first", and clearing the total on a Finished show makes
   it Watching and keeps the episode. Shows are repaired when they load, so an
   old row like Finished at 0 of 148 shows 148 / 148, and the repair is saved
   the next time that show is saved. The API enforces the same rules: a Finished
   show with no total, or whose episode is not the total, is rejected with a
   400.

### API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/healthz` | Liveness check |
| GET | `/readyz` | Readiness check, includes database status |
| GET | `/api/shows` | List all shows; optional `?status=` filter |
| GET | `/api/shows/:id` | Get one show |
| POST | `/api/shows` | Create a show |
| PUT | `/api/shows/:id` | Update a show (partial — omitted fields keep their current value; an explicit `null` clears a field) |
| DELETE | `/api/shows/:id` | Delete a show |
| GET | `/api/search?q=` | Search TVMaze by title |
| GET | `/api/search/shows/:externalId` | Look up one TVMaze show, including total episode count for ended shows |

Every `/api/*` route requires HTTP Basic Auth (`401` with a
`WWW-Authenticate` header otherwise); `/healthz` and `/readyz` are open so the
host's health check works.

All routes return JSON. Errors are `{ "error": "message" }` with an
appropriate status code (400 for invalid input, 404 for a missing show,
429 after too many failed logins, 502 if TVMaze is unreachable). No stack traces or connection details are
ever returned to the client.

**Hardening.** The API sends the standard security headers through `helmet`.
Input is validated on the server: title up to 200 characters, notes up to 2000,
cover URL up to 2048, `currentEpisode` a whole number of 0 or more, and the
status rules above. Failed logins are rate limited to 20 per IP address per 15
minutes; once an IP reaches the limit, every request from it gets a 429 (even
with the correct password) until the window ends. Successful requests do not
count, and `/healthz`, `/readyz` and CORS preflight are not limited. The
server trusts one proxy hop (`trust proxy` is 1) because it runs behind
Render.

## Project structure
Bingelog/
├── client/ # React + Vite frontend
│ └── src/
│ ├── api/ # index.js switches between mockApi.js (demo) and httpApi.js (real)
│ ├── components/ # atoms, molecules, organisms, layout
│ ├── hooks/ # useLoggedIn
│ ├── pages/ # LibraryPage, AddShowPage, ShowDetailPage, LoginPage
│ └── styles/global.css # design tokens (dark grey theme)
│ vercel.json # single-page-app rewrite for Vercel
├── server/ # Express + PostgreSQL backend
│ ├── server.js # routes, validation, error handling
│ ├── showsRepo.js # parameterized queries
│ ├── tvmaze.js # TVMaze client
│ └── db/ # schema.sql, seed.sql, pool.js, run.js
├── docs/screenshots/ # app screenshots
└── .github/workflows/ # GitHub Pages deploy workflow


## Screenshots

*Taken 9 Oct 2026. The demo-mode screenshots use the invented demo data. The
two real-mode screenshots were taken against a local copy of the API with the
same invented seed data, not against the deployed server.*

**Library (demo mode)**

![Library](docs/screenshots/library-demo.png)

**Add Show: search TVMaze, pick a result, confirm (demo mode)**

![Add Show](docs/screenshots/add-show.png)

**Show Detail: type the episode, edit the total, status follows progress (demo mode)**

![Show Detail](docs/screenshots/show-detail.png)

**Show Detail with no total: Finished is unavailable (demo mode)**

![Show Detail, no total](docs/screenshots/show-detail-no-total.png)

**Phone layout, 375px (demo mode)**

![Mobile layout, 375px](docs/screenshots/library-mobile-375.png)

**Real mode: login screen, then the library**

![Login](docs/screenshots/login-real-mode.png)
![Library in real mode](docs/screenshots/library-real-mode.png)

## Known issues and next steps

- **Access gate is a single shared login.** HTTP Basic Auth protects the
  deployed API (one username and password from environment variables), and
  the real-mode client asks for it on a login screen. There are no per-user
  accounts. Failed logins are rate limited, but the counter is in memory (it
  resets when the server restarts), and it is keyed by IP, so one person's
  failed attempts also block other people behind the same address. The public
  Pages demo is unprotected on purpose: it only holds browser-local mock data.
- **Free-tier hosting.** The Render service sleeps when idle, and the API
  connects to Neon as its owner role rather than a limited-permission user.
- **`mockApi.js` duplicates the server's validation and merge-on-update
  logic**, so the two can drift apart.
- **Status/episode rules in demo mode and on old rows.** The server enforces
  the rules, but `mockApi.js` (demo mode) does not. An old stored row that
  breaks them (Finished at the wrong episode, or Finished with no total) is
  repaired by the client when it is opened and saved; until then the Library
  only repairs how it is displayed, and a direct API update to such a row is
  rejected with a 400.
- **No way to add or change a cover image** outside of what TVMaze returns
  — a cover image URL field is planned for manual entries.
- Two moderate `npm audit` findings in dev tooling dependencies, not yet
  addressed.
- **Layout rough edges.** The status badge stretches across the whole row on
  Show Detail, and the episode only saves when you press Save (leaving with
  Back discards it). On a phone the Library now shows two cards per row, but
  the demo-mode banner is tall enough to push them below the fold.
- **Design docs are behind the app.** The M6A3 design-system document still
  describes the light palette and a single system font; the app now uses a
  dark grey palette and Playfair Display for cover fallbacks.
- Hover states, transitions and an empty-state illustration are intentionally
  minimal.

## Credits

- Show titles, covers and episode counts come from the
  [TVMaze API](https://www.tvmaze.com/api) (data licensed CC BY-SA 4.0).
- The cover-fallback typeface is Playfair Display (SIL Open Font License),
  loaded from Google Fonts.

## AI usage

AI credit: ChatGPT was used for planning, DeepSeek generated most of the
server and client code in prompted steps, and Claude gave guidance and wrote
the Basic Auth middleware. I wrote `EpisodeStepper` myself.
See [`AI-USAGE.md`](AI-USAGE.md) for the full disclosure, including what
was AI-written, what I wrote myself, and real cases where the AI got it
wrong.