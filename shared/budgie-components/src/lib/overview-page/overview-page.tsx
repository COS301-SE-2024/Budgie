"use client";
import React, { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Tooltip, CartesianGrid, XAxis, YAxis, Legend, Cell } from 'recharts';
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

  const CATEGORY_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className={`${styles.metricsContainer} ${isDarkMode ? styles.dark : styles.light}`}>
      <button className={styles.toggleButton} onClick={toggleTheme}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      <div className={styles.chartContainer}>
        <div className={styles.chartItem}>
          <h3 className={styles.chartTitle}>Net worth Over Time</h3>
          <LineChart width={600} height={300} data={spendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: 'white' }} />
            <YAxis tick={{ fill: 'white' }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </div>
        <div className={styles.chartItem}>
          <h3 className={styles.chartTitle}>Spending by Category</h3>
          <PieChart width={600} height={300}>
            <Pie
              data={categoryData}
              cx={150}
              cy={150}
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
      <div className={styles.gridContainer}>
        {/* Rest of your grid items */}
        <div className={styles.gridItem}>
          <div className={`${styles.gridTitleContainer} ${isDarkMode ? '' : styles.light}`}>
            <FontAwesomeIcon icon={faMoneyBill} className={styles.icon} />
            <h2 className={styles.gridTitle}>Total Balance for Year</h2>
          </div>
          <p>Total Money in: R25 647.76</p>
          <p>Total Money out: R5 427.28</p>
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
          <p>PURCH Uber Eats 400738******4299</p>
          <p>2024/06/22</p>
          <p>Category: Eating Out</p>
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
