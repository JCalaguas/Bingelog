import { NavLink } from 'react-router-dom';
import { authApi } from '../../api';
import useLoggedIn from '../../hooks/useLoggedIn';
import styles from './Header.module.css';

export default function Header() {
  const loggedIn = useLoggedIn();
  const linkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.brand}>
        BingeLog
      </NavLink>
      <nav className={styles.nav} aria-label="Main">
        <NavLink to="/" end className={linkClass}>
          Library
        </NavLink>
        <NavLink to="/add" className={linkClass}>
          Add show
        </NavLink>
        {authApi.required && loggedIn && (
          <button type="button" className={styles.logout} onClick={authApi.logout}>
            Log out
          </button>
        )}
      </nav>
    </header>
  );
}
