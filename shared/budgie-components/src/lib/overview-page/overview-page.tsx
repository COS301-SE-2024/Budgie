'use client';
import styles from './overview-page.module.css';
import '../../root.css';

export interface OverviewPageProps {}

export function OverviewPage(props: OverviewPageProps) {
  return (
    <div className={styles.mainPage}>
      <div className={styles.totalBalance}>
        <h2>Total Balance</h2>
        <p>R25 647.76</p>
      </div>
      <div className={styles.currentAccounts}>
        <h2>Current Accounts</h2>
        <ul>
          <li>Savings Account</li>
          <li>Cheque Account</li>
          <li>Other Account</li>
        </ul>
      </div>
      <div className={styles.spendingByCategory}>
        <h2>Spending by Category</h2>
        <p>Most spent on: Entertainment</p>
      </div>
      <div className={styles.lastTransaction}>
        <h2>Last Transaction</h2>
        <p>Transaction details here</p>
      </div>
      <div className={styles.upcomingBills}>
        <h2>Upcoming Bills & Payments</h2>
        <ul>
          <li>Car Instalment - Due in 15 days</li>
          <li>Bond Payment - Due in 27 days</li>
        </ul>
      </div>
      <div className={styles.budgetStatus}>
        <h2>Budget Status</h2>
        <p>Amount: R10 000.00</p>
        <div className={styles.budgetBar}>
          <div className={styles.budgetFill}></div>
        </div>
      </div>
      <div className={styles.financialGoals}>
        <h2>Financial Goals Progress</h2>
        <p>A bit far from your target</p>
      </div>
    </div>
  );
}

export default OverviewPage;
