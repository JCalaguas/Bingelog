import Button from '../atoms/Button';
import styles from './ErrorState.module.css';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
