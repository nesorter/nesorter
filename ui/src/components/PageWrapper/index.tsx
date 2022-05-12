import { Link } from 'react-router-dom';
import styles from './styles.module.css';

export const PageWrapper = ({ children }: { children: JSX.Element[] | JSX.Element }) => {
  return (
    <div className={styles.root}>
      <div className={styles.mobileMenu}>
        Classificator
      </div>

      <div className={styles.desktopMenu}>
        <Link to="/" className={styles.link}>Classificator</Link>
        <Link to="/scheduler" className={styles.link}>Scheduler</Link>
        <Link to="/status" className={styles.link}>Status</Link>
      </div>

      <div className={styles.body}>
        {children}
      </div>
    </div>
  );
}
