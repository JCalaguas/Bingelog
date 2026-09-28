import Input from '../atoms/Input';
import Button from '../atoms/Button';
import styles from './SearchBar.module.css';

export default function SearchBar({ value, onChange, onSearch, loading }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className={styles.bar} onSubmit={handleSubmit} role="search">
      <label htmlFor="show-search" className="sr-only">
        Search for a show
      </label>
      <Input
        id="show-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search for a show…"
      />
      <Button type="submit" variant="primary" loading={loading} disabled={value.trim() === ''}>
        Search
      </Button>
    </form>
  );
}
