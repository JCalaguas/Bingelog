import styles from './SearchResultCard.module.css';

export default function SearchResultCard({ result, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={() => onSelect(result)}
      aria-pressed={selected}
    >
      {result.coverUrl ? (
        <img className={styles.cover} src={result.coverUrl} alt="" />
      ) : (
        <span className={styles.placeholder} aria-hidden="true">
          {result.title.charAt(0).toUpperCase()}
        </span>
      )}
      <span className={styles.title}>{result.title}</span>
    </button>
  );
}
