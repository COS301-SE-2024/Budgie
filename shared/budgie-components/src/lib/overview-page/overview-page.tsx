'use client';
import { useState } from 'react';
import styles from './overview-page.module.css';
import '../../root.css';

export interface OverviewPageProps {}

export function OverviewPage(props: OverviewPageProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`${styles.metricsContainer} ${isDarkMode ? styles.dark : styles.light}`}>
      <button className={styles.toggleButton} onClick={toggleTheme}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      <div className={styles.gridContainer}>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <h2 className={styles.gridTitle}>Total Balance</h2>
          </div>
          <p>R25 647.76</p>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <h2 className={styles.gridTitle}>Current Accounts</h2>
          </div>
          <ul>
            <li>Savings Account</li>
            <li>Cheque Account</li>
            <li>Other Account</li>
          </ul>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <h2 className={styles.gridTitle}>Spending by Category</h2>
          </div>
          <p>Most spent on: Entertainment</p>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <h2 className={styles.gridTitle}>Last Transaction</h2>
          </div>
          <p>Transaction details here</p>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <h2 className={styles.gridTitle}>Upcoming Bills & Payments</h2>
          </div>
          <ul>
            <li>Car Instalment - Due in 15 days</li>
            <li>Bond Payment - Due in 27 days</li>
          </ul>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <h2 className={styles.gridTitle}>Budget Status</h2>
          </div>
          <p>Amount: R10 000.00</p>
          <div className={styles.budgetBar}>
            <div className={styles.budgetFill}></div>
          </div>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <h2 className={styles.gridTitle}>Financial Goals Progress</h2>
          </div>
          <p>A bit far from your target</p>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;
