'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill, faBank, faChartPie, faHistory, faCalendarAlt, faListUl, faBullseye } from '@fortawesome/free-solid-svg-icons';
import styles from './overview-page.module.css';
import HealthBar from './HealthBar';
import '../../root.css';

export interface OverviewPageProps {}

export function OverviewPage(props: OverviewPageProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Example progress value for the health bar
  const financialGoalsProgress = 70; // Adjust this value as needed

  // Determine the message based on the progress
  const progressMessage =
    financialGoalsProgress < 50
      ? 'A bit far from your target'
      : 'Doing well towards your target';

  return (
    <div className={`${styles.metricsContainer} ${isDarkMode ? styles.dark : styles.light}`}>
      <button className={styles.toggleButton} onClick={toggleTheme}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      <div className={styles.gridContainer}>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <FontAwesomeIcon icon={faMoneyBill} className={styles.icon} />
            <h2 className={styles.gridTitle}>Total Balance</h2>
          </div>
          <p>R25 647.76</p>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <FontAwesomeIcon icon={faBank} className={styles.icon} />
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
            <FontAwesomeIcon icon={faChartPie} className={styles.icon} />
            <h2 className={styles.gridTitle}>Spending by Category</h2>
          </div>
          <p>Most spent on: Entertainment</p>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <FontAwesomeIcon icon={faHistory} className={styles.icon} />
            <h2 className={styles.gridTitle}>Last Transaction</h2>
          </div>
          <p>Transaction details here</p>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
            <h2 className={styles.gridTitle}>Upcoming Bills & Payments</h2>
          </div>
          <ul>
            <li>Car Instalment - Due in 15 days</li>
            <li>Bond Payment - Due in 27 days</li>
          </ul>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <FontAwesomeIcon icon={faListUl} className={styles.icon} />
            <h2 className={styles.gridTitle}>Budget Status</h2>
          </div>
          <p>Amount: R10 000.00</p>
          <div className={styles.budgetBar}>
            <div className={styles.budgetFill}></div>
          </div>
        </div>
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <FontAwesomeIcon icon={faBullseye} className={styles.icon} />
            <h2 className={styles.gridTitle}>Financial Goals Progress</h2>
          </div>
          <p>{progressMessage}</p>
          <HealthBar progress={financialGoalsProgress} />
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;
