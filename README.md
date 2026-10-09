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

**Live demo:** https://jcalaguas.github.io/Bingelog/ (GitHub Pages, demo mode only, browser `localStorage` data, no real backend)

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
   the next time that show is saved.

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
502 if TVMaze is unreachable). No stack traces or connection details are
ever returned to the client.

## Project structure
Bingelog/
├── client/ # React + Vite frontend
│ └── src/
│ ├── api/ # index.js switches between mockApi.js (demo) and httpApi.js (real)
│ ├── components/ # atoms, molecules, organisms, layout
│ ├── pages/ # LibraryPage, AddShowPage, ShowDetailPage
│ └── styles/global.css # M6A3 design tokens
├── server/ # Express + PostgreSQL backend
│ ├── server.js # routes, validation, error handling
│ ├── showsRepo.js # parameterized queries
│ ├── tvmaze.js # TVMaze client
│ └── db/ # schema.sql, seed.sql, pool.js, run.js
├── docs/screenshots/ # app screenshots
└── .github/workflows/ # GitHub Pages deploy workflow


## Screenshots

*(Demo mode, taken 28 Sep 2026)*

![Library](docs/screenshots/01-library.png)
![Add Show — search results](docs/screenshots/04-addshow.png)
![Show Detail](docs/screenshots/05-showdetails.png)
![Validation error](docs/screenshots/07-notitle.png)
![Delete confirmation](docs/screenshots/08-delete.png)
![Mobile layout, 375px](docs/screenshots/09-375px.png)

## Known issues and next steps

- **Access gate is a single shared login.** HTTP Basic Auth protects the
  deployed API (one username and password from environment variables). There
  are no per-user accounts and no rate limiting on failed logins. The public
  Pages demo is unprotected on purpose: it only holds browser-local mock data.
- **Free-tier hosting.** The Render service sleeps when idle, and the API
  connects to Neon as its owner role rather than a limited-permission user.
- **`mockApi.js` duplicates the server's validation and merge-on-update
  logic**, so the two can drift apart.
- **The status/episode rules are enforced in the client only.** The server
  and `mockApi.js` still accept a Finished show at episode 0 or with no total
  if the API is called directly, and the Library only repairs how an old row
  is displayed until that show is opened and saved.
- **No way to add or change a cover image** outside of what TVMaze returns
  — a cover image URL field is planned for manual entries.
- Two moderate `npm audit` findings in dev tooling dependencies, not yet
  addressed.
- Visual polish (hover states, transitions, empty-state illustration) is
  intentionally minimal for now; the M6A3 tokens are implemented but the
  app is functionally, not visually, complete.

## AI usage

AI credit: ChatGPT was used for planning, DeepSeek generated most of the
server and client code in prompted steps, and Claude gave guidance and wrote
the Basic Auth middleware. I wrote `EpisodeStepper` myself.
See [`AI-USAGE.md`](AI-USAGE.md) for the full disclosure, including what
was AI-written, what I wrote myself, and real cases where the AI got it
wrong.