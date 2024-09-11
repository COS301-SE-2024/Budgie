import styles from './overview-page-revised.module.css';

/* eslint-disable-next-line */
export interface OverviewPageRevisedProps {}

export function OverviewPageRevised(props: OverviewPageRevisedProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to OverviewPageRevised!</h1>
    </div>
  );
}

export default OverviewPageRevised;
