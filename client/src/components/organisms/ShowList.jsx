import ShowCard from '../molecules/ShowCard';
import LoadingState from '../molecules/LoadingState';
import ErrorState from '../molecules/ErrorState';
import EmptyState from '../molecules/EmptyState';
import styles from './ShowList.module.css';

export default function ShowList({
  shows,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  onOpen,
}) {
  if (loading) {
    return <LoadingState label="Loading your library…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!shows || shows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <ul className={styles.grid}>
      {shows.map((show) => (
        <li key={show.id} className={styles.item}>
          <ShowCard show={show} onClick={onOpen} />
        </li>
      ))}
    </ul>
  );
}
