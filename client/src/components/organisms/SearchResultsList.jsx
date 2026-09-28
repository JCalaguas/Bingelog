import SearchResultCard from '../molecules/SearchResultCard';
import LoadingState from '../molecules/LoadingState';
import ErrorState from '../molecules/ErrorState';
import EmptyState from '../molecules/EmptyState';
import styles from './SearchResultsList.module.css';

export default function SearchResultsList({
  results,
  loading,
  error,
  onRetry,
  selectedId,
  onSelect,
  onManual,
}) {
  if (loading) {
    return <LoadingState label="Searching…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!results || results.length === 0) {
    return (
      <EmptyState
        title="No results"
        message="Try a different title, or enter the show manually."
        actionLabel="Enter manually"
        onAction={onManual}
      />
    );
  }

  return (
    <ul className={styles.list}>
      {results.map((result) => (
        <li key={result.externalId} className={styles.item}>
          <SearchResultCard
            result={result}
            selected={result.externalId === selectedId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}
