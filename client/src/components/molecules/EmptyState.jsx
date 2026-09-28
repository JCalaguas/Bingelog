import Button from '../atoms/Button';
import styles from './EmptyState.module.css';

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className={styles.empty}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {actionLabel && onAction && (
        <Button variant="accent" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
