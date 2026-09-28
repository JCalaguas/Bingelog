import Badge from '../atoms/Badge';

const CONFIG = {
  'Plan to Watch': { tone: 'plan', icon: '○' },
  Watching: { tone: 'watching', icon: '●' },
  Finished: { tone: 'finished', icon: '✓' },
};

export default function StatusBadge({ status }) {
  const config = CONFIG[status] || { tone: 'plan', icon: '○' };
  return (
    <Badge tone={config.tone}>
      <span aria-hidden="true">{config.icon}</span>
      <span>{status}</span>
    </Badge>
  );
}
