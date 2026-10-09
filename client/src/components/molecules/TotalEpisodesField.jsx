import { useEffect, useState } from 'react';
import FormField from './FormField';
import Input from '../atoms/Input';

// Editable total episode count. Blank means "unknown" (an ongoing show). The
// value is applied on blur or Enter, not per keystroke, so typing "24" does not
// briefly set the total to 2 and pull the current episode back with it.
export default function TotalEpisodesField({ value, onChange }) {
  const [draft, setDraft] = useState(value == null ? '' : String(value));
  const [error, setError] = useState(null);

  useEffect(() => {
    setDraft(value == null ? '' : String(value));
    setError(null);
  }, [value]);

  function commit() {
    const text = draft.trim();
    if (text === '') {
      setError(null);
      if (value !== null) onChange(null);
      return;
    }
    if (!/^\d+$/.test(text) || Number(text) < 1) {
      setError('Enter a whole number of 1 or more, or leave blank if unknown.');
      return;
    }
    setError(null);
    if (Number(text) !== value) onChange(Number(text));
  }

  return (
    <FormField
      label="Total episodes"
      htmlFor="detail-total"
      error={error}
      hint="Press Enter or click away to apply, then Save."
    >
      <Input
        id="detail-total"
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          }
        }}
        placeholder="Leave blank if unknown"
        invalid={!!error}
      />
    </FormField>
  );
}
