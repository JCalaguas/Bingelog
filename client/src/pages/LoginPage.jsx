import { useState } from 'react';
import { authApi } from '../api';
import FormField from '../components/molecules/FormField';
import Input from '../components/atoms/Input';
import Button from '../components/atoms/Button';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.login(user, pass);
    } catch (err) {
      setError(
        err.status === 401
          ? 'Incorrect username or password.'
          : 'Could not reach the server. It may be waking up, so wait a few seconds and try again.'
      );
      setPass('');
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Log in</h1>
      <p className={styles.hint}>BingeLog is private. Enter the login to open your library.</p>

      <FormField label="Username" htmlFor="login-user">
        <Input
          id="login-user"
          value={user}
          onChange={(event) => setUser(event.target.value)}
          autoComplete="username"
          autoFocus
        />
      </FormField>

      <FormField label="Password" htmlFor="login-pass" error={error}>
        <Input
          id="login-pass"
          type="password"
          value={pass}
          onChange={(event) => setPass(event.target.value)}
          autoComplete="current-password"
          invalid={!!error}
        />
      </FormField>

      <Button type="submit" variant="primary" loading={loading} disabled={!user || !pass}>
        Log in
      </Button>
      {loading && (
        <p className={styles.hint} role="status">
          Checking… the first request can take up to 30 seconds if the server was asleep.
        </p>
      )}
    </form>
  );
}
