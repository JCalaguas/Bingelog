import Header from '../organisms/Header';
import Footer from '../organisms/Footer';
import DemoNotice from '../DemoNotice';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <DemoNotice />
        {children}
      </main>
      <Footer />
    </div>
  );
}
