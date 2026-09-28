import styles from './Button.module.css';

export default function Button({
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant] || ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
