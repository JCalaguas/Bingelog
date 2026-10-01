import { createHash, timingSafeEqual } from 'node:crypto'
import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'
import * as shows from './showsRepo.js'
import * as tvmaze from './tvmaze.js'

const app = express()

// CORS before the routes. Middleware registered after a route never sees that
// route's requests.
//
// Name your origins. app.use(cors()) with no options sends
// Access-Control-Allow-Origin: *, which lets any site on the internet call this
// API from a visitor's browser, and is incompatible with cookies.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '100kb' }))

// Is the process alive?
app.get('/healthz', (request, response) => {
  response.json({ ok: true })
})

// Is the database reachable? A different question, and the one that tells you
// in two seconds which half of a problem you have.
app.get('/readyz', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true, db: 'up' })
  } catch (error) {
    console.error('readyz failed:', error.message)
    response.status(503).json({ ok: false, db: 'down' })
  }
})

// Everything below this line needs a username and password (HTTP Basic Auth).
// /healthz and /readyz stay above it so the host's health check, which cannot
// send credentials, still works. cors() answers preflight requests earlier, so
// it is not blocked here either.
const authUser = process.env.AUTH_USER
const authPass = process.env.AUTH_PASS

if (process.env.NODE_ENV === 'production' && (!authUser || !authPass)) {
  console.error('AUTH_USER and AUTH_PASS must be set in production.')
  process.exit(1)
}

// timingSafeEqual needs equal-length buffers, so hash both sides first.
function safeEqual(a, b) {
  const hash = (value) => createHash('sha256').update(value).digest()
  return timingSafeEqual(hash(a), hash(b))
}

app.use((request, response, next) => {
  if (!authUser || !authPass) return next() // local dev without auth configured

  const header = request.headers.authorization || ''
  if (header.startsWith('Basic ')) {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8')
    const separator = decoded.indexOf(':')
    if (separator !== -1) {
      const user = decoded.slice(0, separator)
      const pass = decoded.slice(separator + 1)
      if (safeEqual(user, authUser) && safeEqual(pass, authPass)) return next()
    }
  }

  response.set('WWW-Authenticate', 'Basic realm="BingeLog"')
  response.status(401).json({ error: 'Authentication required' })
})

const STATUSES = ['Plan to Watch', 'Watching', 'Finished']

function toInt(value, { allowNull = false } = {}) {
  if (value === null || value === undefined || value === '') {
    return allowNull ? null : undefined
  }
  const n = Number(value)
  return Number.isInteger(n) ? n : NaN
}

// Validation lives on the server because the client can be bypassed.
function validateShow(body) {
  const errors = []
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const status = body.status ?? 'Plan to Watch'
  const currentEpisode = toInt(body.currentEpisode ?? 0)
  const totalEpisodes = toInt(body.totalEpisodes, { allowNull: true })
  const rating = toInt(body.rating, { allowNull: true })
  const notes =
    typeof body.notes === 'string' && body.notes.trim() !== '' ? body.notes : null
  const coverUrl =
    typeof body.coverUrl === 'string' && body.coverUrl.trim() !== ''
      ? body.coverUrl
      : null
  const externalId =
    typeof body.externalId === 'string' && body.externalId.trim() !== ''
      ? body.externalId
      : null

  if (!title) errors.push('title is required')
  if (!STATUSES.includes(status)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`)
  }
  if (currentEpisode === undefined || currentEpisode < 0) {
    errors.push('currentEpisode must be an integer of 0 or more')
  }
  if (Number.isNaN(totalEpisodes) || (totalEpisodes !== null && totalEpisodes <= 0)) {
    errors.push('totalEpisodes must be a positive integer or null')
  }
  if (Number.isNaN(rating) || (rating !== null && (rating < 1 || rating > 5))) {
    errors.push('rating must be an integer from 1 to 5 or null')
  }

  return {
    errors,
    value: { title, status, currentEpisode, totalEpisodes, rating, notes, coverUrl, externalId },
  }
}

function toShow(row) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    currentEpisode: row.current_episode,
    totalEpisodes: row.total_episodes,
    rating: row.rating,
    notes: row.notes,
    coverUrl: row.cover_url,
    externalId: row.external_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function parseId(raw) {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

app.get('/api/shows', async (request, response, next) => {
  try {
    const status =
      typeof request.query.status === 'string' ? request.query.status : null
    response.json((await shows.listShows(pool, status)).map(toShow))
  } catch (error) {
    next(error)
  }
})

app.get('/api/shows/:id', async (request, response, next) => {
  const id = parseId(request.params.id)
  if (id === null) {
    return response.status(400).json({ error: 'id must be a positive integer' })
  }
  try {
    const row = await shows.getShowById(pool, id)
    if (!row) return response.status(404).json({ error: 'Show not found' })
    response.json(toShow(row))
  } catch (error) {
    next(error)
  }
})

app.post('/api/shows', async (request, response, next) => {
  const { errors, value } = validateShow(request.body ?? {})
  if (errors.length > 0) {
    return response.status(400).json({ error: errors.join('; ') })
  }
  try {
    response.status(201).json(toShow(await shows.createShow(pool, value)))
  } catch (error) {
    next(error)
  }
})

app.put('/api/shows/:id', async (request, response, next) => {
  const id = parseId(request.params.id)
  if (id === null) {
    return response.status(400).json({ error: 'id must be a positive integer' })
  }
  try {
    const existing = await shows.getShowById(pool, id)
    if (!existing) return response.status(404).json({ error: 'Show not found' })

    // A partial PUT keeps the fields the caller leaves out. Merge the body over
    // the stored row. "undefined" means omitted and keeps the old value; an
    // explicit null still clears the field, so unrating a show still works.
    const current = toShow(existing)
    const body = request.body ?? {}
    const merged = {
      title: body.title !== undefined ? body.title : current.title,
      status: body.status !== undefined ? body.status : current.status,
      currentEpisode:
        body.currentEpisode !== undefined ? body.currentEpisode : current.currentEpisode,
      totalEpisodes:
        body.totalEpisodes !== undefined ? body.totalEpisodes : current.totalEpisodes,
      rating: body.rating !== undefined ? body.rating : current.rating,
      notes: body.notes !== undefined ? body.notes : current.notes,
      coverUrl: body.coverUrl !== undefined ? body.coverUrl : current.coverUrl,
      externalId: body.externalId !== undefined ? body.externalId : current.externalId,
    }

    const { errors, value } = validateShow(merged)
    if (errors.length > 0) {
      return response.status(400).json({ error: errors.join('; ') })
    }

    const row = await shows.updateShow(pool, id, value)
    response.json(toShow(row))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/shows/:id', async (request, response, next) => {
  const id = parseId(request.params.id)
  if (id === null) {
    return response.status(400).json({ error: 'id must be a positive integer' })
  }
  try {
    const removed = await shows.deleteShow(pool, id)
    if (!removed) return response.status(404).json({ error: 'Show not found' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.get('/api/search', async (request, response, next) => {
  const query = typeof request.query.q === 'string' ? request.query.q.trim() : ''
  if (query === '') {
    return response.status(400).json({ error: 'q is required' })
  }
  try {
    response.json(await tvmaze.searchShows(query))
  } catch (error) {
    error.status = 502
    next(error)
  }
})

app.get('/api/search/shows/:externalId', async (request, response, next) => {
  const externalId = request.params.externalId
  if (!/^\d+$/.test(externalId)) {
    return response.status(400).json({ error: 'externalId must be a positive integer' })
  }
  try {
    response.json(await tvmaze.getShow(externalId))
  } catch (error) {
    error.status = 502
    next(error)
  }
})

app.use((request, response) => {
  response.status(404).json({ error: 'No such route' })
})

// The detail goes in your logs; the visitor gets a plain message. Sending a
// stack trace to a stranger tells them about your file layout and dependencies.
app.use((error, request, response, next) => {
  console.error(error)
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'Invalid JSON body' })
  }
  if (error.status === 502) {
    return response.status(502).json({ error: 'Metadata service unavailable' })
  }
  response.status(500).json({ error: 'Something went wrong on the server' })
})

// The host chooses the port and tells you through PORT. Hardcoding 3000 is the
// commonest reason a first deploy is marked unhealthy and killed.
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})
