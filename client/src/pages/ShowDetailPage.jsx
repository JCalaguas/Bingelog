import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { showsApi } from '../api';
import Button from '../components/atoms/Button';
import LoadingState from '../components/molecules/LoadingState';
import ErrorState from '../components/molecules/ErrorState';
import EmptyState from '../components/molecules/EmptyState';
import ShowDetailPanel from '../components/organisms/ShowDetailPanel';
import styles from './ShowDetailPage.module.css';

const FIELDS = [
  'title',
  'status',
  'currentEpisode',
  'totalEpisodes',
  'rating',
  'notes',
  'coverUrl',
  'externalId',
];

export default function ShowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [draft, setDraft] = useState(null);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    showsApi
      .get(id)
      .then((data) => {
        if (!cancelled) {
          setDraft(data);
          setOriginal(data);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const handleChange = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError(null);
    const payload = {};
    for (const field of FIELDS) {
      if (draft[field] !== original[field]) {
        payload[field] = draft[field];
      }
    }
    try {
      await showsApi.update(id, payload);
      navigate('/');
    } catch (err) {
      setSaveError({ form: err.message });
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${draft.title}"? This cannot be undone.`)) {
      return;
    }
    setDeleteLoading(true);
    try {
      await showsApi.remove(id);
      navigate('/');
    } catch (err) {
      setSaveError({ form: err.message });
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading show…" />;
  }

  if (notFound) {
    return (
      <EmptyState
        title="Show not found"
        message="This show may have been deleted."
        actionLabel="Back to library"
        onAction={() => navigate('/')}
      />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />;
  }

  if (!draft) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <Button variant="secondary" onClick={() => navigate('/')}>
          ← Back
        </Button>
      </div>
      <ShowDetailPanel
        show={draft}
        onChange={handleChange}
        onSave={handleSave}
        onDelete={handleDelete}
        saveLoading={saveLoading}
        deleteLoading={deleteLoading}
        errors={saveError}
      />
    </div>
  );
}
