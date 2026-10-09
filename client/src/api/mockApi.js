// The simulated backend.
//
// Same function names, same return shapes, and the same failure shape as
// httpApi.js (an Error with a .status), so your components cannot tell the
// difference. Data lives in the visitor's own browser and goes no further.
//
// This exists so the template's GitHub Pages link works on day one and so you
// can build the interface before your API is deployed.

import seed from './seed.json'

const KEY = 'final-project:shows'

const STATUSES = ['Plan to Watch', 'Watching', 'Finished']

// A real network is not instant. Keeping this delay is what forces you to build
// a loading state now, while it is cheap, instead of discovering you need one
// the day you switch to the real API.
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

function httpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function read() {
  const stored = localStorage.getItem(KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Corrupted storage. Start again rather than crashing the app.
      localStorage.removeItem(KEY)
    }
  }
  return seed.slice()
}

function write(rows) {
  localStorage.setItem(KEY, JSON.stringify(rows))
  return rows
}

function nextId(rows) {
  return Math.max(0, ...rows.map((row) => Number(row.id))) + 1
}

function toInt(value, { allowNull = false } = {}) {
  if (value === null || value === undefined || value === '') {
    return allowNull ? null : undefined
  }
  const n = Number(value)
  return Number.isInteger(n) ? n : NaN
}

// Mirrors the server's validation, so demo mode fails the same way the real API
// does. The one extra rule (currentEpisode <= totalEpisodes) is enforced here
// too because the server relies on a database CHECK constraint.
function validateShow(input) {
  if (typeof input.title !== 'string' || input.title.trim() === '') {
    return { error: 'title is required' }
  }

  const status = input.status ?? 'Plan to Watch'
  if (!STATUSES.includes(status)) {
    return { error: `status must be one of: ${STATUSES.join(', ')}` }
  }

  const currentEpisode = toInt(input.currentEpisode ?? 0)
  if (currentEpisode === undefined || currentEpisode < 0) {
    return { error: 'currentEpisode must be an integer of 0 or more' }
  }

  const totalEpisodes = toInt(input.totalEpisodes, { allowNull: true })
  if (Number.isNaN(totalEpisodes) || (totalEpisodes !== null && totalEpisodes <= 0)) {
    return { error: 'totalEpisodes must be a positive integer or null' }
  }
  if (totalEpisodes !== null && currentEpisode > totalEpisodes) {
    return { error: 'currentEpisode must not exceed totalEpisodes' }
  }

  const rating = toInt(input.rating, { allowNull: true })
  if (Number.isNaN(rating) || (rating !== null && (rating < 1 || rating > 5))) {
    return { error: 'rating must be an integer from 1 to 5 or null' }
  }

  const notes =
    typeof input.notes === 'string' && input.notes.trim() !== '' ? input.notes : null
  const coverUrl =
    typeof input.coverUrl === 'string' && input.coverUrl.trim() !== ''
      ? input.coverUrl
      : null
  const externalId =
    typeof input.externalId === 'string' && input.externalId.trim() !== ''
      ? input.externalId
      : null

  return {
    value: {
      title: input.title.trim(),
      status,
      currentEpisode,
      totalEpisodes,
      rating,
      notes,
      coverUrl,
      externalId,
    },
  }
}

// A small hardcoded catalogue that stands in for TVMaze in demo mode, so search
// works even when the library is empty. "totalEpisodes: null" means an ongoing
// show with no known end.
const CATALOG = [
  { externalId: 'tv-101', title: 'Steel Horizon', coverUrl: null, totalEpisodes: 24 },
  { externalId: 'tv-102', title: 'Moonlit Alley', coverUrl: null, totalEpisodes: 13 },
  { externalId: 'tv-103', title: 'Crimson Circuit', coverUrl: null, totalEpisodes: null },
  { externalId: 'tv-104', title: 'Paper Lanterns', coverUrl: null, totalEpisodes: 26 },
  { externalId: 'tv-105', title: 'Northbound', coverUrl: null, totalEpisodes: 10 },
  { externalId: 'tv-106', title: 'Salt & Ember', coverUrl: null, totalEpisodes: 8 },
  { externalId: 'tv-107', title: 'The Hollow Hour', coverUrl: null, totalEpisodes: null },
]

export const showsApi = {
  async list(status) {
    await delay()
    const rows = status ? read().filter((row) => row.status === status) : read()
    return rows.sort((a, b) => a.title.localeCompare(b.title))
  },

  async get(id) {
    await delay()
    const found = read().find((row) => String(row.id) === String(id))
    if (!found) throw httpError(404, 'Show not found')
    return found
  },

  async create(show) {
    await delay()
    const result = validateShow(show ?? {})
    if (result.error) throw httpError(400, result.error)
    const now = new Date().toISOString()
    const created = {
      ...result.value,
      id: nextId(read()),
      createdAt: now,
      updatedAt: now,
    }
    write([...read(), created])
    return created
  },

  async update(id, show) {
    await delay()
    const rows = read()
    const index = rows.findIndex((row) => String(row.id) === String(id))
    if (index === -1) throw httpError(404, 'Show not found')

    const current = rows[index]
    const result = validateShow({
      title: show?.title !== undefined ? show.title : current.title,
      status: show?.status !== undefined ? show.status : current.status,
      currentEpisode:
        show?.currentEpisode !== undefined ? show.currentEpisode : current.currentEpisode,
      totalEpisodes:
        show?.totalEpisodes !== undefined ? show.totalEpisodes : current.totalEpisodes,
      rating: show?.rating !== undefined ? show.rating : current.rating,
      notes: show?.notes !== undefined ? show.notes : current.notes,
      coverUrl: show?.coverUrl !== undefined ? show.coverUrl : current.coverUrl,
      externalId: show?.externalId !== undefined ? show.externalId : current.externalId,
    })
    if (result.error) throw httpError(400, result.error)

    rows[index] = { ...current, ...result.value, updatedAt: new Date().toISOString() }
    write(rows)
    return rows[index]
  },

  async remove(id) {
    await delay()
    const rows = read()
    const index = rows.findIndex((row) => String(row.id) === String(id))
    if (index === -1) throw httpError(404, 'Show not found')
    rows.splice(index, 1)
    write(rows)
  },
}

export const searchApi = {
  async search(q) {
    await delay()
    const term = typeof q === 'string' ? q.trim().toLowerCase() : ''
    return CATALOG.filter((entry) => entry.title.toLowerCase().includes(term)).map(
      ({ externalId, title, coverUrl }) => ({ externalId, title, coverUrl })
    )
  },

  async getShow(externalId) {
    await delay()
    const entry = CATALOG.find((item) => String(item.externalId) === String(externalId))
    if (!entry) throw httpError(404, 'Show not found')
    return {
      externalId: entry.externalId,
      title: entry.title,
      coverUrl: entry.coverUrl,
      totalEpisodes: entry.totalEpisodes,
    }
  },
}

// Demo mode has no server and no login.
export const authApi = {
  required: false,
  isLoggedIn: () => true,
  subscribe: () => () => {},
  login: async () => {},
  logout: () => {},
}
