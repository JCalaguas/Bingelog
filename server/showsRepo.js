// The data-access layer for shows.
//
// Every query is parameterised: values go in the array, never into the string.
// This is the single most important habit in database code, and it is what
// stops "'; DROP TABLE shows; --" in a form field from being a real problem.

export async function listShows(pool, status) {
  let sql = 'SELECT * FROM shows'
  const values = []
  if (status) {
    values.push(status)
    sql += ` WHERE status = $${values.length}`
  }
  sql += ' ORDER BY title ASC'
  const result = await pool.query(sql, values)
  return result.rows
}

export async function getShowById(pool, id) {
  const result = await pool.query('SELECT * FROM shows WHERE id = $1', [id])
  return result.rows[0] ?? null
}

export async function createShow(pool, show) {
  const result = await pool.query(
    `INSERT INTO shows
       (title, status, current_episode, total_episodes, rating, notes, cover_url, external_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      show.title,
      show.status,
      show.currentEpisode,
      show.totalEpisodes,
      show.rating,
      show.notes,
      show.coverUrl,
      show.externalId,
    ]
  )
  return result.rows[0]
}

export async function updateShow(pool, id, show) {
  const result = await pool.query(
    `UPDATE shows SET
       title = $1,
       status = $2,
       current_episode = $3,
       total_episodes = $4,
       rating = $5,
       notes = $6,
       cover_url = $7,
       external_id = $8,
       updated_at = now()
     WHERE id = $9
     RETURNING *`,
    [
      show.title,
      show.status,
      show.currentEpisode,
      show.totalEpisodes,
      show.rating,
      show.notes,
      show.coverUrl,
      show.externalId,
      id,
    ]
  )
  return result.rows[0] ?? null
}

export async function deleteShow(pool, id) {
  const result = await pool.query('DELETE FROM shows WHERE id = $1 RETURNING id', [id])
  return result.rowCount > 0
}
