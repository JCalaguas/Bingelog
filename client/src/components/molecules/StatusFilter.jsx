import FormField from './FormField';
import Select from '../atoms/Select';
import { STATUSES } from '../../constants';

export default function StatusFilter({ value, onChange }) {
  const options = [
    { value: '', label: 'All statuses' },
    ...STATUSES.map((status) => ({ value: status, label: status })),
  ];

  return (
    <FormField label="Filter by status" htmlFor="status-filter">
      <Select
        id="status-filter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        options={options}
      />
    </FormField>
  );
}
