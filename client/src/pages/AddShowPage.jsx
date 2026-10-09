import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi, showsApi } from '../api';
import AddShowForm from '../components/organisms/AddShowForm';
import styles from './AddShowPage.module.css';

export default function AddShowPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [totalEpisodes, setTotalEpisodes] = useState('');
  const [status, setStatus] = useState('Plan to Watch');

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSearch = async () => {
    const term = query.trim();
    if (!term) return;

    setSearchLoading(true);
    setSearchError(null);
    setResults(null);
    try {
      const data = await searchApi.search(term);
      setResults(data);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelect = async (result) => {
    setSelectedLoading(true);
    setSelected(null);
    setSaveError(null);
    try {
      const show = await searchApi.getShow(result.externalId);
      setSelected(show);
      setTitle(show.title);
      setTotalEpisodes(show.totalEpisodes != null ? String(show.totalEpisodes) : '');
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSelectedLoading(false);
    }
  };

  const handleManual = () => {
    setSelected(null);
    setSaveError(null);
    document.getElementById('add-title')?.focus();
  };

  const mapSaveError = (message) => {
    if (/title/i.test(message)) return { title: message };
    if (/totalEpisodes/i.test(message)) return { totalEpisodes: message };
    return { form: message };
  };

  const handleSave = async () => {
    setSaveError(null);

    const total = totalEpisodes === '' ? null : Number(totalEpisodes);

    // Keep status and progress consistent. Only Plan to Watch sits at episode 0.
    // A finished show has watched every episode (the total, once it is known;
    // until then 1, and it syncs to the total when one is entered later).
    const currentEpisode =
      status === 'Finished' ? (total ?? 1) : status === 'Watching' ? 1 : 0;

    setSaveLoading(true);

    const payload = {
      title: title.trim(),
      status,
      currentEpisode,
      totalEpisodes: total,
      coverUrl: selected?.coverUrl ?? null,
      externalId: selected?.externalId ?? null,
    };

    try {
      await showsApi.create(payload);
      navigate('/');
    } catch (err) {
      setSaveError(mapSaveError(err.message));
      setSaveLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Add show</h1>
      <AddShowForm
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        searchLoading={searchLoading}
        searchError={searchError}
        onRetrySearch={handleSearch}
        results={results}
        selectedId={selected?.externalId ?? null}
        onSelect={handleSelect}
        selected={selected}
        selectedLoading={selectedLoading}
        title={title}
        onTitleChange={setTitle}
        totalEpisodes={totalEpisodes}
        onTotalEpisodesChange={setTotalEpisodes}
        status={status}
        onStatusChange={setStatus}
        onSave={handleSave}
        onCancel={() => navigate('/')}
        saveLoading={saveLoading}
        saveError={saveError}
        onManual={handleManual}
      />
    </div>
  );
}
