import styles from './EpisodeStepper.module.css';

export default function EpisodeStepper({ value, total, onChange }) {
  // 1. Can we go down? 
  // The lowest valid episode is 0.
  const canDecrement = value > 0;

  // 2. Can we go up? 
  // If total is null or undefined, there is no limit. 
  // We check `total == null` first so we don't compare a number against null.
  const canIncrement = total == null || value < total;

  function handleDecrement() {
    if (canDecrement) {
      onChange(value - 1);
    }
  }

  function handleIncrement() {
    if (canIncrement) {
      onChange(value + 1);
    }
  }

  return (
    <div className={styles.stepper}>
      <button 
        type="button" 
        aria-label="Previous episode"
        onClick={handleDecrement} 
        disabled={!canDecrement}
        className={styles.button}
      >
        -
      </button>

      <span className={styles.display}>
        {total == null ? (
          `Ep ${value}`
        ) : (
          <>
            {value} <span className={styles.muted}>/ {total}</span>
          </>
        )}
      </span>

      <button 
        type="button" 
        aria-label="Next episode"
        onClick={handleIncrement} 
        disabled={!canIncrement}
        className={styles.button}
      >
        +
      </button>
    </div>
  );
}