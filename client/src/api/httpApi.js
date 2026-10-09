// The real client. Every function here talks to YOUR Express API.
//
// This is the file that matters for your finals project. mockApi.js exists so
// you can build the interface before this has anywhere to point.

const BASE = import.meta.env.VITE_API_BASE_URL || ''

// --- Login -----------------------------------------------------------------
//
// The API sits behind HTTP Basic Auth. The password is typed by the visitor at
// run time and is NEVER part of the build: anything in a VITE_ variable is
// public. It is kept in sessionStorage (gone when the tab closes), and is never
// logged or put in an error message.

const AUTH_KEY = 'bingelog:auth'
const listeners = new Set()

function readToken() {
  try {
    return sessionStorage.getItem(AUTH_KEY)
  } catch {
    return null
  }
}

function writeToken(value) {
  try {
    if (value) sessionStorage.setItem(AUTH_KEY, value)
    else sessionStorage.removeItem(AUTH_KEY)
  } catch {
    // Storage blocked (private mode, etc). The token still lives in memory.
  }
}

let token = readToken()

function notify() {
  listeners.forEach((listener) => listener())
}

function encode(user, pass) {
  // btoa only takes Latin-1, so go through UTF-8 bytes first.
  const bytes = new TextEncoder().encode(`${user}:${pass}`)
  return btoa(String.fromCharCode(...bytes))
}

async function request(path, options, { authToken = token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (authToken) headers.Authorization = `Basic ${authToken}`

  const response = await fetch(`${BASE}${path}`, { headers, ...options })

  if (response.status === 401 && authToken && authToken === token) {
    // The saved login stopped working (changed password, expired session).
    token = null
    writeToken(null)
    notify()
  }

  if (!response.ok) {
    // Try to use the API's own message; fall back to the status line.
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // The body was not JSON. The status line is all we have.
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return response.status === 204 ? null : response.json()
}

export const authApi = {
  required: true,
  isLoggedIn: () => token !== null,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  // Proves the credentials with a real request BEFORE they are saved, so a wrong
  // password never unlocks anything. Throws with status 401 if it is rejected.
  async login(user, pass) {
    const candidate = encode(user, pass)
    await request('/api/shows', undefined, { authToken: candidate })
    token = candidate
    writeToken(token)
    notify()
  },
  logout() {
    token = null
    writeToken(null)
    notify()
  },
}

export const showsApi = {
  list: (status) =>
    request(`/api/shows${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  get: (id) => request(`/api/shows/${id}`),
  create: (show) => request('/api/shows', { method: 'POST', body: JSON.stringify(show) }),
  update: (id, show) =>
    request(`/api/shows/${id}`, { method: 'PUT', body: JSON.stringify(show) }),
  remove: (id) => request(`/api/shows/${id}`, { method: 'DELETE' }),
}

export const searchApi = {
  search: (q) => request(`/api/search?q=${encodeURIComponent(q)}`),
  getShow: (externalId) => request(`/api/search/shows/${externalId}`),
}
