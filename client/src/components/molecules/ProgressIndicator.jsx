import styles from './ProgressIndicator.module.css';

export default function ProgressIndicator({ current, total }) {
  if (total == null) {
    return <span className={styles.text}>Ep {current}</span>;
  }

  const percentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className={styles.wrap}>
      <div
        className={styles.bar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
      <span className={styles.text}>
        {current} / {total}
      </span>
    </div>
  );
}
