"use client";
import React, { use, useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Tooltip, CartesianGrid, XAxis, YAxis, Legend, Cell } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill, faBank, faChartPie, faHistory, faCalendarAlt, faListUl, faBullseye } from '@fortawesome/free-solid-svg-icons';
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
  getExpensesByCategory
 } from "../overview-page/overviewServices";

export interface OverviewPageProps {}

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
  }

  const [showData, setShowData] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountType, setSelectedAccountType] = useState('Current');
  const [moneyIn, setMoneyIn] = useState(0);
  const [moneyOut, setMoneyOut] = useState(0);
  const [lastTransaction, setLastTransaction] = useState<Transaction>(defaultTransaction);
  const [monthlyIncome, setMonthlyIncome] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [expenseByCategory, setExpenseByCategory] = useState([]);


  const getData = async (number:string) => {
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
}

  useEffect(() => {
    async function someFunction() {
      const account = await getAccounts();
      if (account.length > 0) {
        setAccounts(account);
        setShowData(true);
        setSelectedAccountType(account[0].alias);
        getData(account[0].account_number);
      }
    }
    someFunction();
  }, [showData]);

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Example progress value for the health bar
  const financialGoalsProgress = 70; // Adjust this value as needed

  // Determine the message based on the progress
  const progressMessage =
    financialGoalsProgress < 50
      ? 'A bit far from your target, please reevaluate your planning'
      : 'Doing well towards your target, keep up the good work';

  // Sample data for charts
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
    { name: 'Utilities', value: expenseByCategory[1]  },
    { name: 'Entertainment', value: expenseByCategory[2]  },
    { name: 'Transport', value: expenseByCategory[3]  },
    { name: 'Insurance', value: expenseByCategory[4]  },
    { name: 'Medical Aid', value: expenseByCategory[5]  },
    { name: 'Eating Out', value: expenseByCategory[6]  },
    { name: 'Shopping', value: expenseByCategory[7]  },
    { name: 'Other', value: expenseByCategory[8]  },
  ];

  const CATEGORY_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042','#FFBB','#00C4', '#FFB', '#FFAACC'];

  const hasAccounts = showData;

  const filteredAccounts = accounts.filter(account => account.type === selectedAccountType);

  return (
    <div className={styles.mainPage}>
      <div className={styles.header}>
        <div className={styles.accountTypeButtons}>
          {accounts.map(account => (
            <button
              key={account.alias}
              className={`${styles.accountTypeButton} ${selectedAccountType === account.alias ? styles.active : ''}`}
              onClick={() => {
                setSelectedAccountType(account.alias);
                getData(account.account_number);
              }}
            >
              {account.alias}
            </button>
          ))}
        </div>
      </div>
      {hasAccounts ? (
      <div className={styles.accountStatus}>
        
        {moneyIn>0 ? (
          <div className={`${styles.metricsContainer} ${isDarkMode ? styles.dark : styles.light}`}>
            <button className={styles.toggleButton} onClick={toggleTheme}>
              {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
            <div className={styles.fullWidthChart}>
              <div className={styles.chartTitleContainer}>
                <h3 className={styles.chartTitle}>Net Worth Over Time</h3>
              </div>
              <LineChart width={1000} height={300} data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? 'white' : 'black' }} />
                <YAxis tick={{ fill: isDarkMode ? 'white' : 'black' }} />
                <Tooltip />
                <Line type="monotone" dataKey="Expenses" stroke="red" />
                <Line type="monotone" dataKey="Income" stroke="green" />
              </LineChart>
            </div>
            <div className={styles.fullWidthChart}>
              <div className={styles.chartTitleContainer}>
                <h3 className={styles.chartTitle}>Spending by Category</h3>
              </div>
              <PieChart width={1000} height={300}>
                <Pie
                  data={categoryData}
                  cx={500}
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
            <div className={styles.gridContainer}>
              <div className={styles.gridItem}>
                <div className={styles.gridTitleContainer}>
                  <FontAwesomeIcon icon={faMoneyBill} className={styles.icon} />
                  <h2 className={styles.gridTitle}>Total Balance for Year</h2>
                </div>
                <p>Total Money in: R {moneyIn}</p>
                <p>Total Money out: R {moneyOut}</p>
              </div>

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
                  <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
                  <h2 className={styles.gridTitle}>Upcoming Bills & Payments</h2>
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
            </div>
          </div>
        ) : (
          <div className={styles.bodyText}>
          <p>You have not uploaded <br/>
              any transactions for this year. <br/><br/>
              Head to the accounts <br/>
              section to upload your transactions.
          </p>
          </div>
        )}
      </div>
    ) : (
        <div className={styles.bodyText}>
          <p>You have not uploaded <br/>
              any transactions. <br/><br/>
              Head to the accounts <br/>
              section to upload your first <br/>
              transaction history.
          </p>
        </div>
    )}
    </div>
  );
}

export default OverviewPage;
