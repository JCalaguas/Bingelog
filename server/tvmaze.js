// TVMaze metadata client. A server-side proxy so the client never talks to
// TVMaze directly, and so BingeLog owns the user's data separately from the
// metadata it imports (title, cover, and for ended shows the episode count).

const TVMAZE_BASE_URL = process.env.TVMAZE_BASE_URL || 'https://api.tvmaze.com'

const REQUEST_TIMEOUT_MS = 8000

async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new Error(`TVMaze responded with ${response.status}`)
    }
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

function toCover(show) {
  return show?.image?.medium ?? show?.image?.original ?? null
}

export async function searchShows(query) {
  const url = `${TVMAZE_BASE_URL}/search/shows?q=${encodeURIComponent(query)}`
  const results = await fetchJson(url)
  return (Array.isArray(results) ? results : []).map((entry) => ({
    externalId: String(entry.show.id),
    title: entry.show.name,
    coverUrl: toCover(entry.show),
  }))
}

export async function getShow(externalId) {
  const [show, episodes] = await Promise.all([
    fetchJson(`${TVMAZE_BASE_URL}/shows/${encodeURIComponent(externalId)}`),
    fetchJson(`${TVMAZE_BASE_URL}/shows/${encodeURIComponent(externalId)}/episodes`),
  ])

  const ended = show?.status === 'Ended'
  const totalEpisodes =
    ended && Array.isArray(episodes) ? episodes.length : null

  return {
    externalId: String(show.id),
    title: show.name,
    coverUrl: toCover(show),
    totalEpisodes,
  }
}
