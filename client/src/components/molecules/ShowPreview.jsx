import styles from './ShowPreview.module.css';

export default function ShowPreview({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div className={styles.preview}>
      {result.coverUrl ? (
        <img className={styles.cover} src={result.coverUrl} alt="" />
      ) : (
        <span className={styles.placeholder} aria-hidden="true">
          {result.title.charAt(0).toUpperCase()}
        </span>
      )}
      <div className={styles.body}>
        <h2 className={styles.title}>{result.title}</h2>
        <p className={styles.meta}>
          {result.totalEpisodes != null
            ? `${result.totalEpisodes} episodes`
            : 'Episodes: unknown'}
        </p>
      </div>
    </div>
  );
}
