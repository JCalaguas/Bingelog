export const STATUSES = ['Plan to Watch', 'Watching', 'Finished']

export const RATING_MAX = 5

// 0 episodes watched = Plan to Watch, anything in between = Watching, and all
// episodes = Finished. A show with no known total can never be Finished: it is
// Plan to Watch at episode 0 and Watching otherwise.
export function statusFromProgress(current, total) {
  if (!current) return 'Plan to Watch'
  if (total && current >= total) return 'Finished'
  return 'Watching'
}

// Repairs a show whose status and episode contradict the rules above. Used when
// a show loads and before it is saved, so old rows fix themselves:
//   - Finished with a known total: the episode becomes the total (0 of 148 -> 148 of 148)
//   - Finished with no total: not allowed, so the status follows the episode
export function normalizeShow(show) {
  if (show.status !== 'Finished') return show
  const total = show.totalEpisodes ?? null
  if (total) {
    return show.currentEpisode === total ? show : { ...show, currentEpisode: total }
  }
  return { ...show, status: statusFromProgress(show.currentEpisode, null) }
}
