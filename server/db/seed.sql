-- Sample data for development. All titles and details are invented.
--
-- This starts with TRUNCATE. That is correct on your laptop and catastrophic
-- against the database your live demo depends on. Check which DATABASE_URL is
-- loaded before you run it.

TRUNCATE TABLE shows RESTART IDENTITY CASCADE;

INSERT INTO shows (title, status, current_episode, total_episodes, rating, notes, cover_url, external_id, created_at, updated_at) VALUES
  ('Steel Horizon',
   'Watching',
   12, 24, 4,
   'Pacing picked up around episode 9.',
   NULL, 'tv-101',
   now() - interval '30 days', now() - interval '2 days'),
  ('Moonlit Alley',
   'Finished',
   13, 13, 5,
   'Ending stuck the landing. Rewatched the finale.',
   NULL, 'tv-102',
   now() - interval '90 days', now() - interval '20 days'),
  ('Crimson Circuit',
   'Watching',
   4, NULL, NULL,
   'Weekly release, no total episode count yet.',
   NULL, 'tv-103',
   now() - interval '12 days', now() - interval '1 day'),
  ('Paper Lanterns',
   'Plan to Watch',
   0, 26, NULL,
   NULL,
   NULL, 'tv-104',
   now() - interval '5 days', now() - interval '5 days'),
  ('Northbound',
   'Finished',
   10, 10, 3,
   'Decent but the middle dragged.',
   NULL, 'tv-105',
   now() - interval '120 days', now() - interval '60 days'),
  ('Glass Garden',
   'Watching',
   2, 12, NULL,
   'Added manually; no metadata match.',
   NULL, NULL,
   now() - interval '3 days', now() - interval '3 days');
