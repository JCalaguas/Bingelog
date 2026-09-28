import StatusBadge from '../molecules/StatusBadge';
import FormField from '../molecules/FormField';
import Select from '../atoms/Select';
import Textarea from '../atoms/Textarea';
import Button from '../atoms/Button';
import EpisodeStepper from '../EpisodeStepper';
import ProgressIndicator from '../molecules/ProgressIndicator';
import RatingInput from '../molecules/RatingInput';
import { STATUSES } from '../../constants';
import styles from './ShowDetailPanel.module.css';

export default function ShowDetailPanel({
  show,
  onChange,
  onSave,
  onDelete,
  saveLoading,
  deleteLoading,
  errors = {},
}) {
  const statusOptions = STATUSES.map((value) => ({ value, label: value }));

  return (
    <div className={styles.panel}>
      <div className={styles.coverWrap}>
        {show.coverUrl ? (
          <img className={styles.cover} src={show.coverUrl} alt="" />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            {show.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className={styles.details}>
        <h2 className={styles.title}>{show.title}</h2>
        <StatusBadge status={show.status} />

        <FormField label="Status" htmlFor="detail-status">
          <Select
            id="detail-status"
            value={show.status}
            onChange={(event) => onChange('status', event.target.value)}
            options={statusOptions}
          />
        </FormField>

        <FormField label="Episode">
          <EpisodeStepper
            value={show.currentEpisode}
            total={show.totalEpisodes ?? null}
            onChange={(value) => onChange('currentEpisode', value)}
          />
        </FormField>

        <ProgressIndicator current={show.currentEpisode} total={show.totalEpisodes} />

        <FormField label="Rating">
          <RatingInput
            value={show.rating ?? 0}
            onChange={(value) => onChange('rating', value === 0 ? null : value)}
          />
        </FormField>

        <FormField label="Notes" htmlFor="detail-notes">
          <Textarea
            id="detail-notes"
            value={show.notes ?? ''}
            onChange={(event) => onChange('notes', event.target.value)}
            placeholder="Your thoughts on this show…"
          />
        </FormField>

        {errors.form && (
          <p className={styles.error} role="alert">
            {errors.form}
          </p>
        )}

        <div className={styles.actions}>
          <Button variant="primary" loading={saveLoading} onClick={onSave}>
            Save
          </Button>
          <Button variant="danger" loading={deleteLoading} onClick={onDelete}>
            Delete show
          </Button>
        </div>
      </div>
    </div>
  );
}
