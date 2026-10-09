import styles from './Select.module.css';

export default function Select({ id, value, onChange, options, disabled, invalid, ...rest }) {
  return (
    <select
      id={id}
      className={`${styles.select} ${invalid ? styles.invalid : ''}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
