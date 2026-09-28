import StatusBadge from './StatusBadge';
import ProgressIndicator from './ProgressIndicator';
import styles from './ShowCard.module.css';

export default function ShowCard({ show, onClick }) {
  return (
    <button type="button" className={styles.card} onClick={() => onClick(show)}>
      {show.coverUrl ? (
        <img className={styles.cover} src={show.coverUrl} alt="" />
      ) : (
        <span className={styles.placeholder} aria-hidden="true">
          {show.title.charAt(0).toUpperCase()}
        </span>
      )}
      <span className={styles.body}>
        <span className={styles.title}>{show.title}</span>
        <StatusBadge status={show.status} />
        <ProgressIndicator current={show.currentEpisode} total={show.totalEpisodes} />
      </span>
    </button>
  );
}
