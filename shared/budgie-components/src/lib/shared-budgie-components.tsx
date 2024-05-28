import styles from './shared-budgie-components.module.css';

/* eslint-disable-next-line */
export interface SharedBudgieComponentsProps {}

export function SharedBudgieComponents(props: SharedBudgieComponentsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SharedBudgieComponents!</h1>
    </div>
  );
}

export default SharedBudgieComponents;
