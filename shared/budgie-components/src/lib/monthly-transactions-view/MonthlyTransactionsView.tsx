'use client';
import styles from '../all-transactions-view/AllTransactionsView.module.css';
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import UploadStatementCSV from '../upload-statement-csv/UploadStatementCSV';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query, 
  where
} from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import '../../root.css';
import { json } from 'stream/consumers';
import Metrics from '../metrics/Metrics'; // Import the Metrics component

export interface MonthlyTransactionsViewProps {
  account: string;
  data: any;
}

export function MonthlyTransactionsView(props: MonthlyTransactionsViewProps) {
  const [balance, setBalance] = useState(0);
  const [moneyIn, setMoneyIn] = useState(0);
  const [moneyOut, setMoneyOut] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [Data, setData] = useState<any>(null);
  const user = useContext(UserContext);

  interface Transaction {
    date: string;
    amount: number;
    balance: number;
    description: string;
    category: string;
  }

  const handleNextMonth = () => {
    //change year
    if (currentMonth.getFullYear() != currentYear) {
      setCurrentYear(currentMonth.getFullYear());
    }
    //cants go passed next month
    const Now = new Date();
    if (
      currentMonth.getMonth() != Now.getMonth() + 1 ||
      currentYear != Now.getFullYear()
    ) {
      //change the month
      setCurrentMonth(
        new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
      );
    }
    display();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
    );
    if (currentMonth.getFullYear() != currentYear) {
      setCurrentYear(currentMonth.getFullYear());
    }
    display();
  };

  const formatMonthYear = (date: any) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  useEffect(() => {
    const getYearlyTransactions = async () => {
      try {
        const q = query(collection(db, `transaction_data_${currentYear}`), where('uid', '==', user.uid), where('account_number', '==', props.account));
        const querySnapshot = await getDocs(q);
        const transactionList = querySnapshot.docs.map(doc => doc.data());
        setData(transactionList[0]);
      } catch (error) {
        console.error('Error getting bank statement document:', error);
      }
    };

    const auth = getAuth();
    if (auth) {
      const user = auth.currentUser;
      if (user !== null) {
        getYearlyTransactions();
      }
    }
    //console.log("new");
  }, [currentYear]);

  useEffect(() => {
    if (Data === null) {
      //console.log("No");
    }
    else 
    {
      display();
    }
  }, [Data]);

  useEffect(() => {
    setData(props.data);
  }, []);


  const display = async () => {
    const month = currentMonth
      .toLocaleString('default', { month: 'long' })
      .toLocaleLowerCase();
    if (Data === undefined || Data[month] === undefined || Data[month] === null) {
      setTransactions([]);
      setBalance(0);
      setMoneyIn(0);
      setMoneyOut(0);
    } else {
      const transactionsList = JSON.parse(Data[month]);
      setTransactions(transactionsList);
      setBalance(JSON.parse(Data[month])[0].balance);
      
      const moneyInTotal = transactionsList
        .filter((transaction: { amount: number; }) => transaction.amount > 0)
        .reduce((acc: any, transaction: { amount: any; }) => acc + transaction.amount, 0);

      const moneyOutTotal = transactionsList
        .filter((transaction: { amount: number; }) => transaction.amount < 0)
        .reduce((acc: any, transaction: { amount: any; }) => acc + transaction.amount, 0);

      setMoneyIn(moneyInTotal);
      setMoneyOut(Math.abs(moneyOutTotal)); // money out should be positive for display
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    const selectedCategory = event.target.value;
    if (selectedCategory === 'Add category') {
      alert('under construction');
    } else {
      const updatedTransactions = transactions.map((transaction, i) =>
        i === index ? { ...transaction, category: selectedCategory } : transaction
      );
  
      setTransactions(updatedTransactions);
      await updateDoc(
        doc(db, `transaction_data_${currentYear}`, `${user.uid}`),
        {
          [monthNames[currentMonth.getMonth()]]: JSON.stringify(updatedTransactions),
        }
      );
    }
  };
  
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Income':
        return styles.income;
      case 'Transport':
        return styles.transport;
      case 'Eating Out':
        return styles.eatingOut;
      case 'Groceries':
        return styles.groceries;
      case 'Entertainment':
        return styles.entertainment;
      case 'Shopping':
        return styles.shopping;
      case 'Insurance':
        return styles.insurance;
      case 'Utilities':
        return styles.utilities;
      case 'Medical Aid':
        return styles.medicalAid;
      case 'Other':
        return styles.other;
      default:
        return styles.default;
    }
  };

  const formatCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  };

  const formatTransactionValue = (value: number) => {
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: 'decimal',
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  };  

  return (
    <div className={styles.mainPage}>
      <div className={styles.header}>
        <div className={styles.monthNavigation}>
          <button className={styles.navButton} onClick={handlePrevMonth}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 'calc(1.4rem * var(--font-size-multiplier))', alignContent:'center', display: 'flex'}}
            >
              arrow_back_ios
            </span>
          </button>
          <span className={styles.monthDisplay}>
            {formatMonthYear(currentMonth)}
          </span>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            onClick={handleNextMonth}
          />
          <button className={styles.navButton} onClick={handleNextMonth}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 'calc(1.4rem * var(--font-size-multiplier))', alignContent:'center', display: 'flex'}}
            >
              arrow_forward_ios
            </span>
          </button>
        </div>
            <div className={styles.balanceInfo}>
              Balance:  {formatCurrency(balance)}
              <p className={styles.moneyInfo}>Money In:  {formatCurrency(moneyIn)}</p>
              <p className={styles.moneyInfo}>Money Out:  {formatCurrency(moneyOut)}</p>
            </div>  
      </div>

      {balance !== null && (
        <div className={styles.transactionsList}>
          {transactions.length > 0 && (
            <div className={styles.transactions}>
              <br/>
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className={styles.transactionCard}
                  style={{
                    borderLeft:
                      transaction.amount >= 0
                        ? '15px solid #293652'
                        : '15px solid #8EE5A2',
                  }}
                >
                    <div className={styles.transactionContent}>
                        <div className={styles.transactionDate}>
                          {transaction.date}
                        </div>
                        <div className={styles.transactionDescription}>
                          {transaction.description}
                        </div>
                      <div className={styles.transactionAmount}>
                        {formatTransactionValue(transaction.amount)}                   
                      </div>
                      <select
                          className={`${styles.categoryDropdown} ${getCategoryStyle(transaction.category)}`}
                          onChange={(event) => handleChange(event, index)}
                          value={transaction.category}
                        >
                          <option value=""></option>
                          <option value="Income">Income</option>
                          <option value="Transport">Transport</option>
                          <option value="Eating Out">Eating Out</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Insurance">Insurance</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Medical Aid">Medical Aid</option>
                          <option value="Other">Other</option>
                      </select>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MonthlyTransactionsView;

