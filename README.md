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

**Live demo:** https://jcalaguas.github.io/Bingelog/ (GitHub Pages, demo mode only — the API is not yet deployed, see Known Issues)

## Features and usage

1. **Library** (`/`) — browse your saved shows, filter by status (Plan to
   Watch / Watching / Finished), open a show, or start adding one.
2. **Add Show** (`/add`) — search TVMaze by title, select a result to import
   its cover and (for ended shows) total episode count, confirm or edit the
   details, and save. If search fails or returns nothing useful, switch to
   manual entry and fill in the title yourself — total episodes is optional.
3. **Show Detail** (`/show/:id`) — update status, step the current episode
   up or down (clamped between 0 and the total, if known), set a 1–5 rating,
   write notes, save your changes, or delete the show (with a confirmation
   prompt).

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

- **No access gate yet.** The deployed client has no login in front of it.
  Once the API is deployed, an access layer (Cloudflare Zero Trust or HTTP
  Basic Auth) needs to be added before the app is treated as "live" —
  see `SECURITY-CHECKLIST.md`.
- **API and database are not deployed.** Only the static client is live on
  GitHub Pages, running in demo mode. The Express API and PostgreSQL
  database still need a host (e.g. Render/Railway + Neon/Supabase).
- **Status doesn't auto-update to "Finished"** when the current episode
  reaches the total — planned, not yet built.
- **No way to add or change a cover image** outside of what TVMaze returns
  — a cover image URL field is planned for manual entries.
- Two moderate `npm audit` findings in dev tooling dependencies, not yet
  addressed.
- Visual polish (hover states, transitions, empty-state illustration) is
  intentionally minimal for now; the M6A3 tokens are implemented but the
  app is functionally, not visually, complete.

## AI usage

This project used AI assistance for both planning and implementation.
See [`AI-USAGE.md`](AI-USAGE.md) for the full disclosure, including what
was AI-written, what I wrote myself, and real cases where the AI got it
wrong.