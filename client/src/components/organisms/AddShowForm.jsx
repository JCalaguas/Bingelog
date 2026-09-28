import SearchBar from '../molecules/SearchBar';
import SearchResultsList from './SearchResultsList';
import ShowPreview from '../molecules/ShowPreview';
import FormField from '../molecules/FormField';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import Button from '../atoms/Button';
import { STATUSES } from '../../constants';
import styles from './AddShowForm.module.css';

export default function AddShowForm({
  query,
  onQueryChange,
  onSearch,
  searchLoading,
  searchError,
  onRetrySearch,
  results,
  selectedId,
  onSelect,
  selected,
  selectedLoading,
  title,
  onTitleChange,
  totalEpisodes,
  onTotalEpisodesChange,
  status,
  onStatusChange,
  onSave,
  onCancel,
  saveLoading,
  saveError,
  onManual,
}) {
  const showResults = searchLoading || searchError || results !== null;

  const statusOptions = STATUSES.map((value) => ({ value, label: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.searchColumn}>
        <SearchBar
          value={query}
          onChange={onQueryChange}
          onSearch={onSearch}
          loading={searchLoading}
        />

        {showResults && (
          <SearchResultsList
            results={results}
            loading={searchLoading}
            error={searchError}
            onRetry={onRetrySearch}
            selectedId={selectedId}
            onSelect={onSelect}
            onManual={onManual}
          />
        )}
      </div>

      <div className={styles.formColumn}>
        {selectedLoading && <p className={styles.hint}>Loading show details…</p>}
        {selected && <ShowPreview result={selected} />}

        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.heading}>
            {selected ? 'Confirm details' : 'Enter manually'}
          </h2>

          <FormField label="Title" htmlFor="add-title" error={saveError?.title}>
            <Input
              id="add-title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Show title"
              invalid={!!saveError?.title}
            />
          </FormField>

          <FormField
            label="Total episodes"
            htmlFor="add-total"
            error={saveError?.totalEpisodes}
          >
            <Input
              id="add-total"
              type="number"
              min={1}
              value={totalEpisodes}
              onChange={(event) => onTotalEpisodesChange(event.target.value)}
              placeholder="Leave blank if unknown"
              invalid={!!saveError?.totalEpisodes}
            />
          </FormField>

          <FormField label="Status" htmlFor="add-status">
            <Select
              id="add-status"
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              options={statusOptions}
            />
          </FormField>

          {saveError?.form && (
            <p className={styles.error} role="alert">
              {saveError.form}
            </p>
          )}

          <div className={styles.actions}>
            <Button type="submit" variant="primary" loading={saveLoading}>
              Save show
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
