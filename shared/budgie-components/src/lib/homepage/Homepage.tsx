import styles from './Homepage.module.css';

/* eslint-disable-next-line */
export interface HomepageProps {}

export function Homepage(props: HomepageProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Homepage!</h1>
    </div>
  );
}

export default Homepage;
