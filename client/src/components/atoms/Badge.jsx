import styles from './Badge.module.css';

export default function Badge({ tone = 'plan', children }) {
  return <span className={`${styles.badge} ${styles[tone] || ''}`}>{children}</span>;
}
