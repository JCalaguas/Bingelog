import { useEffect, useState } from 'react';
import styles from './EpisodeStepper.module.css';

export default function EpisodeStepper({ value, total, onChange }) {
  // The lowest valid episode is 0. With no known total there is no upper limit.
  const canDecrement = value > 0;
  const canIncrement = total == null || value < total;

  // What the user is typing. Kept as text so the field can be empty mid-edit.
  const [draft, setDraft] = useState(String(value));

  // Follow the real value when the buttons (or a save) change it.
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit() {
    if (draft.trim() === '' || !/^\d+$/.test(draft.trim())) {
      setDraft(String(value));
      return;
    }
    let next = Number(draft);
    if (total != null && next > total) next = total;
    setDraft(String(next));
    if (next !== value) onChange(next);
  }

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        aria-label="Previous episode"
        onClick={() => canDecrement && onChange(value - 1)}
        disabled={!canDecrement}
        className={styles.button}
      >
        −
      </button>

      <label className={styles.display}>
        <span className="sr-only">Current episode</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
            }
          }}
          onFocus={(event) => event.target.select()}
        />
        {total == null ? (
          <span className={styles.muted}>(no total)</span>
        ) : (
          <span className={styles.muted}>/ {total}</span>
        )}
      </label>

      <button
        type="button"
        aria-label="Next episode"
        onClick={() => canIncrement && onChange(value + 1)}
        disabled={!canIncrement}
        className={styles.button}
      >
        +
      </button>
    </div>
  );
}
