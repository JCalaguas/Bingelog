import styles from './Input.module.css';

export default function Input({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  invalid,
  ...rest
}) {
  return (
    <input
      id={id}
      type={type}
      className={`${styles.input} ${invalid ? styles.invalid : ''}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      {...rest}
    />
  );
}
