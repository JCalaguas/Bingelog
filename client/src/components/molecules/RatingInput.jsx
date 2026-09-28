import styles from './RatingInput.module.css';

export default function RatingInput({ value = 0, onChange, max = 5, disabled }) {
  const handleClick = (star) => {
    onChange(star === value ? 0 : star);
  };

  return (
    <div className={styles.rating} role="group" aria-label="Rating">
      {Array.from({ length: max }, (_, index) => index + 1).map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= value ? styles.active : ''}`}
          onClick={() => handleClick(star)}
          disabled={disabled}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={star <= value}
        >
          ★
        </button>
      ))}
      <span className={styles.label} aria-live="polite">
        {value > 0 ? `${value} / ${max}` : 'No rating'}
      </span>
    </div>
  );
}
