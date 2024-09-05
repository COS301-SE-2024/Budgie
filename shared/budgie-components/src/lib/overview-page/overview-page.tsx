'use client';
import React, { useEffect, useState } from 'react';
import { LineChart } from '@tremor/react'; // Tremor-specific import
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts'; // Recharts-specific import
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useThemeSettings } from '../../useThemes';
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
import {
  getAccounts,
  getTransactions,
  getMoneyIn,
  getMoneyOut,
  getLastTransaction,
  getMonthlyIncome,
  getMonthlyExpenses,
  getExpensesByCategory,
} from '../overview-page/overviewServices';

export interface OverviewPageProps { }

export function OverviewPage(props: OverviewPageProps) {
  interface Account {
    account_number: string;
    alias: string;
    name: string;
    type: string;
    uid: string;
  }

  interface Transaction {
    date: string;
    amount: number;
    balance: number;
    description: string;
    category: string;
  }

  const defaultTransaction: Transaction = {
    date: '',
    amount: 0,
    balance: 0,
    description: '',
    category: '',
  };

  const [showData, setShowData] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountType, setSelectedAccountType] = useState('Current');
  const [moneyIn, setMoneyIn] = useState(0);
  const [moneyOut, setMoneyOut] = useState(0);
  const [lastTransaction, setLastTransaction] =
    useState<Transaction>(defaultTransaction);
  const [monthlyIncome, setMonthlyIncome] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [expenseByCategory, setExpenseByCategory] = useState([]);
  useThemeSettings();
  const getData = async (number: string) => {
    const transaction = await getTransactions(number);
    const moneyI = await getMoneyIn(transaction);
    setMoneyIn(moneyI);
    const moneyO = await getMoneyOut(transaction);
    setMoneyOut(moneyO);
    const lastT = await getLastTransaction(transaction);
    setLastTransaction(lastT);
    const monthly = await getMonthlyIncome(transaction);
    setMonthlyIncome(monthly);
    const monthlyE = await getMonthlyExpenses(transaction);
    setMonthlyExpenses(monthlyE);
    const categoryExpenses = await getExpensesByCategory(transaction);
    setExpenseByCategory(categoryExpenses);
  };

  useEffect(() => {
    async function someFunction() {
      const account = await getAccounts();
      if (account?.length > 0) {
        setAccounts(account);
        setShowData(true);
        setSelectedAccountType(account[0].alias);
        getData(account[0].account_number);
      }
    }
    someFunction();

    const storedTheme = localStorage.getItem('data-theme') || 'light';
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, [showData]);

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const financialGoalsProgress = 70;

  const progressMessage =
    financialGoalsProgress < 50
      ? 'A bit far from your target, please reevaluate your planning'
      : 'Doing well towards your target, keep up the good work';

  const spendingData = [
    { name: 'Jan', Income: monthlyIncome[0], Expenses: monthlyExpenses[0] },
    { name: 'Feb', Income: monthlyIncome[1], Expenses: monthlyExpenses[1] },
    { name: 'Mar', Income: monthlyIncome[2], Expenses: monthlyExpenses[2] },
    { name: 'Apr', Income: monthlyIncome[3], Expenses: monthlyExpenses[3] },
    { name: 'May', Income: monthlyIncome[4], Expenses: monthlyExpenses[4] },
    { name: 'Jun', Income: monthlyIncome[5], Expenses: monthlyExpenses[5] },
    { name: 'Jul', Income: monthlyIncome[6], Expenses: monthlyExpenses[6] },
    { name: 'Aug', Income: monthlyIncome[7], Expenses: monthlyExpenses[7] },
    { name: 'Sep', Income: monthlyIncome[8], Expenses: monthlyExpenses[8] },
    { name: 'Oct', Income: monthlyIncome[9], Expenses: monthlyExpenses[9] },
    { name: 'Nov', Income: monthlyIncome[10], Expenses: monthlyExpenses[10] },
    { name: 'Dec', Income: monthlyIncome[11], Expenses: monthlyExpenses[11] },
  ];

  const categoryData = [
    { name: 'Groceries', value: expenseByCategory[0] },
    { name: 'Utilities', value: expenseByCategory[1] },
    { name: 'Entertainment', value: expenseByCategory[2] },
    { name: 'Transport', value: expenseByCategory[3] },
    { name: 'Insurance', value: expenseByCategory[4] },
    { name: 'Medical Aid', value: expenseByCategory[5] },
    { name: 'Eating Out', value: expenseByCategory[6] },
    { name: 'Shopping', value: expenseByCategory[7] },
    { name: 'Other', value: expenseByCategory[8] },
  ];

  const CATEGORY_COLORS = [
    '#A98DFB',
    '#FDAD73',
    '#FD7575',
    '#4EB5FF',
    '#72F1E2',
    '#C1C1C1',
    '#FFCD4E',
    '#FB94F1',
    'var(--main-text)',
  ];

  const hasAccounts = accounts.length > 0;

  return (
    <div className="mainPage">
      <div className={styles.header}>
        <div className={styles.accountTypeButtons}>
          {accounts.map((account) => (
            <div
              key={account.alias}
              className={`${styles.accountTypeText} ${selectedAccountType === account.alias ? styles.active : ''
                }`}
              onClick={() => {
                setSelectedAccountType(account.alias);
                getData(account.account_number);
              }}
            >
              {account.alias}
            </div>
          ))}
        </div>
      </div>
      {hasAccounts ? (
        <div className={styles.accountStatus}>
          {moneyIn > 0 ? (
            <div
              className={`${styles.metricsContainer} ${isDarkMode ? styles.dark : styles.light
                }`}
            >
              {/*<button
                className={`${styles.toggleButton} ${styles.greenButton}`}
                onClick={toggleTheme}
              >
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>*/}
              {/* Summary container */}
              <div className={styles.gridContainer}>
                <div className={styles.gridItem}>
                  <div className={styles.chartTitleContainer}>
                    <h3 className={styles.chartTitle}>Summary</h3>
                  </div>
                  <p>Net Worth: R245 754.48</p>
                  <p>Average Daily Spend: R2 759.57</p>
                  <h4>Top Three Categories:</h4>
                  <div>
                    <div className={styles.legendContainer}>
                      {categoryData
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 3)
                        .map((category, index) => (
                          <div key={category.name} className={styles.legendItem}>
                            <div className={styles.legendBox} style={{ backgroundColor: CATEGORY_COLORS[index] }}>
                              <span className={styles.legendText}>{category.name}</span>
                            </div>
                          </div>
                        ))}
                    </div>

                  </div>
                </div>

                <div className={styles.gridItem}>
                  <div className={styles.chartTitleContainer}>
                    <h3 className={styles.chartTitle}>Spending by Category</h3>
                  </div>
                  <PieChart width={500} height={300}>
                    <Pie
                      data={categoryData}
                      cx={250}
                      cy={150}
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


              <div className={styles.fullWidthChart}>
                <div className={styles.chartTitleContainer}>
                  <h3 className={styles.chartTitle}>Net Worth Over Time</h3>
                </div>
                <LineChart
                  className="h-80"
                  data={spendingData}
                  index="name"
                  categories={['Income', 'Expenses']}
                  colors={['green', 'red']}
                  valueFormatter={(number: number) =>
                    `R ${Intl.NumberFormat('en-ZA').format(number).toString()}`
                  }
                  yAxisWidth={60}
                  onValueChange={(v) => console.log(v)}
                />
              </div>

              <div className={styles.gridContainer}>


                <div className={styles.gridItem}>
                  <div className={styles.gridTitleContainer}>
                    <FontAwesomeIcon icon={faHistory} className={styles.icon} />
                    <h2 className={styles.gridTitle}>Last Transaction</h2>
                  </div>
                  <p>Date: {lastTransaction.date}</p>
                  <p>Amount: R {lastTransaction.amount}</p>
                  <p>Description: {lastTransaction.description}</p>
                  <p>Category: {lastTransaction.category}</p>
                </div>

                <div className={styles.gridItem}>
                  <div className={styles.gridTitleContainer}>
                    <FontAwesomeIcon icon={faListUl} className={styles.icon} />
                    <h2 className={styles.gridTitle}>Financial Health Score</h2>
                  </div>
                  Bracket Comparison summary and link to page
                </div>
              </div>
              <div className={styles.fullWidthChart}>
                <div className={styles.chartTitleContainer}>
                  <h3 className={styles.chartTitle}>Upcoming Payments</h3>
                </div>
                <div className={styles.paymentContainer}>
                  <div className={styles.paymentBox}>
                    <span className={styles.paymentDate}>2024/12/15</span>
                    <span className={styles.paymentName}>Netflix</span>
                    <span className={styles.paymentAmount}>-R175.4</span>
                  </div>
                  <div className={styles.paymentBox}>
                    <span className={styles.paymentDate}>2024/12/20</span>
                    <span className={styles.paymentName}>Spotify</span>
                    <span className={styles.paymentAmount}>-R99.9</span>
                  </div>
                  <div className={styles.paymentBox}>
                    <span className={styles.paymentDate}>2024/12/25</span>
                    <span className={styles.paymentName}>Electricity</span>
                    <span className={styles.paymentAmount}>-R350.0</span>
                  </div>
                  <div className={styles.paymentBox}>
                    <span className={styles.paymentDate}>2024/12/30</span>
                    <span className={styles.paymentName}>Internet</span>
                    <span className={styles.paymentAmount}>-R250.0</span>
                  </div>
                </div>
              </div>


            </div>
          ) : (
            <div className={styles.bodyText}>
              <p>
                You have not uploaded <br />
                any transactions for this year. <br />
                <br />
                Head to the accounts <br />
                section to upload your transactions.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.bodyText}>
          <p>
            You have not uploaded <br />
            any transactions. <br />
            <br />
            Head to the accounts <br />
            section to create new accounts.
          </p>
        </div>
      )}
    </div>
  );
}

export default OverviewPage;
