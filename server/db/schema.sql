-- The complete shape of the database. Safe to run against an empty database,
-- and safe to run twice.

CREATE TABLE IF NOT EXISTS shows (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'Plan to Watch'
                     CHECK (status IN ('Plan to Watch', 'Watching', 'Finished')),
  current_episode  INTEGER NOT NULL DEFAULT 0
                     CHECK (current_episode >= 0),
  total_episodes   INTEGER
                     CHECK (total_episodes IS NULL OR total_episodes > 0),
  rating           INTEGER
                     CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  notes            TEXT,
  cover_url        TEXT,
  external_id      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    total_episodes IS NULL
    OR current_episode <= total_episodes
  )
);

-- The library page filters by status, so index it rather than scanning every
-- row on each request.
CREATE INDEX IF NOT EXISTS shows_status_idx
  ON shows (status);
