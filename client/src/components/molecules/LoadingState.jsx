import styles from './LoadingState.module.css';

export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
