import Input from '../atoms/Input';
import Button from '../atoms/Button';
import styles from './LibrarySearch.module.css';

export default function LibrarySearch({ value, onChange }) {
  return (
    <div className={styles.bar} role="search">
      <label htmlFor="library-search" className="sr-only">
        Search your library
      </label>
      <Input
        id="library-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search your library…"
      />
      {value && (
        <Button type="button" variant="secondary" onClick={() => onChange('')}>
          Clear
        </Button>
      )}
    </div>
  );
}
