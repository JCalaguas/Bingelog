import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showsApi } from '../api';
import Button from '../components/atoms/Button';
import LibrarySearch from '../components/molecules/LibrarySearch';
import StatusFilter from '../components/molecules/StatusFilter';
import ShowList from '../components/organisms/ShowList';
import styles from './LibraryPage.module.css';

export default function LibraryPage() {
  const navigate = useNavigate();
  const [shows, setShows] = useState(null);
  const [filter, setFilter] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    showsApi
      .list(filter)
      .then((data) => {
        if (!cancelled) setShows(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, reloadKey]);

  const term = query.trim().toLowerCase();
  const visibleShows = useMemo(
    () =>
      shows && term
        ? shows.filter((show) => show.title.toLowerCase().includes(term))
        : shows,
    [shows, term]
  );

  const openShow = (show) => navigate(`/show/${show.id}`);
  const retry = () => setReloadKey((key) => key + 1);

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Library</h1>
        <Button variant="accent" onClick={() => navigate('/add')}>
          + Add show
        </Button>
      </div>

      <LibrarySearch value={query} onChange={setQuery} />

      <StatusFilter value={filter} onChange={setFilter} />

      <ShowList
        shows={visibleShows}
        loading={loading}
        error={error}
        onRetry={retry}
        emptyTitle={term ? 'No matches' : filter ? 'No shows here' : 'No shows yet'}
        emptyMessage={
          term
            ? `No shows${filter ? ` with the "${filter}" status` : ''} match "${query.trim()}".`
            : filter
              ? `You have no shows with the "${filter}" status.`
              : 'Add your first show to start tracking.'
        }
        emptyActionLabel={filter || term ? null : 'Add your first show'}
        onEmptyAction={() => navigate('/add')}
        onOpen={openShow}
      />
    </div>
  );
}
