'use client';
import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Cell,
} from 'recharts';
import { useThemeSettings } from '../../useThemes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBill,
  faBank,
  faChartPie,
  faHistory,
  faCalendarAlt,
  faListUl,
  faBullseye,
} from '@fortawesome/free-solid-svg-icons';
import styles from './overview-page.module.css';
import HealthBar from './HealthBar';
import '../../root.css';
import { getAccounts } from '../overview-page/overviewServices';

export interface OverviewPageProps {}

export function OverviewPage(props: OverviewPageProps) {
  const [showData, setShowData] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountType, setSelectedAccountType] = useState('Current');

  interface Account {
    account_number: string;
    alias: string;
    name: string;
    type: string;
    uid: string;
  }
  useThemeSettings();
  useEffect(() => {
    async function someFunction() {
      const account = await getAccounts();
      if (account.length > 0) {
        setAccounts(account);
        setShowData(true);
      }
    }
    someFunction();
  }, [showData]);

  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Example progress value for the health bar
  const financialGoalsProgress = 70; // Adjust this value as needed

  // Determine the message based on the progress
  const progressMessage =
    financialGoalsProgress < 50
      ? 'A bit far from your target,please revaluate your planning'
      : 'Doing well towards your target,keep up the good work';

  // Sample data for charts
  const spendingData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 },
    { name: 'Apr', value: 500 },
    { name: 'May', value: 450 },
    { name: 'Jun', value: 600 },
  ];

  const categoryData = [
    { name: 'Groceries', value: 200 },
    { name: 'Utilities', value: 100 },
    { name: 'Entertainment', value: 200 },
    { name: 'Transport', value: 150 },
    { name: 'Insurance', value: 150 },
    { name: 'Medical Aid', value: 150 },
    { name: 'Eating Out', value: 150 },
    { name: 'Shopping', value: 150 },
    { name: 'Other', value: 150 },
  ];

  const CATEGORY_COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#FFBB',
    '#00C4',
    '#FFB',
    '#FFAACC',
  ];

  const hasAccounts = showData;

  const filteredAccounts = accounts.filter(
    (account) => account.type === selectedAccountType
  );

  return (
    <div className="mainPage">
      <div className={styles.header}>
        <div className={styles.accountTypeButtons}>
          <button
            className={`${styles.accountTypeButton} ${
              selectedAccountType === 'Current' ? styles.active : ''
            }`}
            onClick={() => setSelectedAccountType('Current')}
          >
            Current
          </button>
          <button
            className={`${styles.accountTypeButton} ${
              selectedAccountType === 'Savings' ? styles.active : ''
            }`}
            onClick={() => setSelectedAccountType('Savings')}
          >
            Savings
          </button>
          <button
            className={`${styles.accountTypeButton} ${
              selectedAccountType === 'Custom' ? styles.active : ''
            }`}
            onClick={() => setSelectedAccountType('Custom')}
          >
            Custom
          </button>
        </div>
      </div>

      <div className={styles.accountStatus}>
        {hasAccounts ? (
          <div
            className={`${styles.metricsContainer} ${
              isDarkMode ? styles.dark : styles.light
            }`}
          >
            <button className={styles.toggleButton} onClick={toggleTheme}>
              {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
            <div className={styles.chartContainer}>
              <div className={styles.chartItem}>
                <div className={styles.chartTitleContainer}>
                  <h3 className={styles.chartTitle}>Net Worth Over Time</h3>
                </div>
                <LineChart width={650} height={300} data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: isDarkMode ? 'white' : 'black' }}
                  />
                  <YAxis tick={{ fill: isDarkMode ? 'white' : 'black' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </div>
              <div className={styles.chartItem}>
                <div className={styles.chartTitleContainer}>
                  <h3 className={styles.chartTitle}>Spending by Category</h3>
                </div>
                <PieChart width={600} height={300}>
                  <Pie
                    data={categoryData}
                    cx={250}
                    cy={120}
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>
            <div className={styles.gridContainer}>
              <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                  <FontAwesomeIcon icon={faMoneyBill} className={styles.icon} />
                  <h2 className={styles.gridTitle}>Total Balance for Year</h2>
                </div>
                <p>Total Money in: R25 647.76</p>
                <p>Total Money out: R5 427.28</p>
              </div>
              <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                  <FontAwesomeIcon icon={faBank} className={styles.icon} />
                  <h2 className={styles.gridTitle}>Current Accounts</h2>
                </div>
                <ul>
                  {filteredAccounts.map((account) => (
                    <li key={account.uid}>{account.alias}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                  <FontAwesomeIcon icon={faHistory} className={styles.icon} />
                  <h2 className={styles.gridTitle}>Last Transaction</h2>
                </div>
                <p>PURCH Uber Eats 400738******4299</p>
                <p>2024/06/22</p>
                <p>Category: Eating Out</p>
              </div>
              <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className={styles.icon}
                  />
                  <h2 className={styles.gridTitle}>
                    Upcoming Bills & Payments
                  </h2>
                </div>
                <ul>
                  <li>Car Instalment - Due in 15 days</li>
                  <li>Bond Payment - Due in 27 days</li>
                </ul>
              </div>
              <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                  <FontAwesomeIcon icon={faListUl} className={styles.icon} />
                  <h2 className={styles.gridTitle}>Budget Status</h2>
                </div>
                <p>Amount Targeted: R5000.00</p>
                <p>Amount Spent: R3000.00</p>
                <HealthBar progress={60} />
              </div>
              <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                  <FontAwesomeIcon icon={faBullseye} className={styles.icon} />
                  <h2 className={styles.gridTitle}>Financial Goals Progress</h2>
                </div>
                <p>{progressMessage}</p>
                <HealthBar progress={financialGoalsProgress} />
              </div>
            </div>
          </div>
        ) : (
          <p>There are no accounts available to display.</p>
        )}
      </div>
    </div>
  );
}

export default OverviewPage;
