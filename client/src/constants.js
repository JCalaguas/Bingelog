export const STATUSES = ['Plan to Watch', 'Watching', 'Finished']

export const RATING_MAX = 5

// 0 episodes watched = Plan to Watch, all episodes = Finished, anything in
// between = Watching. With an unknown total, any progress counts as Watching.
export function statusFromProgress(current, total) {
  if (!current) return 'Plan to Watch'
  if (total && current >= total) return 'Finished'
  return 'Watching'
}
