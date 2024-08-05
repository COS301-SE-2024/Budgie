import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.mainPageBlurModal}>
      <div className="w-full h-full bg-BudgieGrayLight animate-pulse duration-75"></div>
    </div>
  );
}
