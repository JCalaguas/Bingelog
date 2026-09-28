import styles from './Textarea.module.css';

export default function Textarea({ id, value, onChange, rows = 4, disabled, invalid, ...rest }) {
  return (
    <textarea
      id={id}
      className={`${styles.textarea} ${invalid ? styles.invalid : ''}`}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      {...rest}
    />
  );
}
