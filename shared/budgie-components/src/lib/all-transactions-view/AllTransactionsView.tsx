'use client';
import styles from '../all-transactions-view/AllTransactionsView.module.css';
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { useThemeSettings } from '../../useThemes';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from 'firebase/auth';
import '../../root.css';

export interface AllTransactionsViewProps {
  account: string;
  availableYears: number[];
}

export function AllTransactionsView(props: AllTransactionsViewProps) {
  const [balance, setBalance] = useState(0);
  const [moneyIn, setMoneyIn] = useState(0);
  const [moneyOut, setMoneyOut] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [Data, setData] = useState<any>(null);
  const user = useContext(UserContext);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [yearsWithData, setYearsWithData] = useState<number[]>([]);
  useThemeSettings();
  interface Transaction {
    date: string;
    amount: number;
    balance: number;
    description: string;
    category: string;
  }

  const handleNextYear = () => {
    const Now = new Date();
    if (Now.getFullYear() != currentYear) {
      setCurrentYear(currentYear + 1);
      display();
    }
  };

  const handlePrevYear = () => {
    setCurrentYear(currentYear - 1);
    display();
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
        const q = query(
          collection(db, `transaction_data_${currentYear}`),
          where('uid', '==', user.uid),
          where('account_number', '==', props.account)
        );
        const querySnapshot = await getDocs(q);
        const transactionList = querySnapshot.docs.map((doc) => doc.data());
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
  }, [currentYear]);

  useEffect(() => {
    if (Data !== null) {
      display();
    }
  }, [Data]);

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  const display = async () => {
    if (Data != null) {
      let transactionsList: any[] = [];
      for (let i = 0; i < 12; i++) {
        if (Data[monthNames[i]]) {
          const addMonth = JSON.parse(Data[monthNames[i]]);
          transactionsList = transactionsList.concat(addMonth);
          setBalance(JSON.parse(Data[monthNames[i]])[0].balance);
        }
      }
      setTransactions(transactionsList);
      const moneyInTotal = transactionsList
        .filter((transaction: { amount: number }) => transaction.amount > 0)
        .reduce(
          (acc: any, transaction: { amount: any }) => acc + transaction.amount,
          0
        );

      const moneyOutTotal = transactionsList
        .filter((transaction: { amount: number }) => transaction.amount < 0)
        .reduce(
          (acc: any, transaction: { amount: any }) => acc + transaction.amount,
          0
        );

      setMoneyIn(moneyInTotal);
      setMoneyOut(Math.abs(moneyOutTotal)); // moneyOut should be positive for display
    } else {
      setTransactions([]);
      setBalance(0);
      setMoneyIn(0);
      setMoneyOut(0);
    }
  };

  const handleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    const selectedCategory = event.target.value;
    const transactionMonth = parseInt(event.target.id.substring(5, 7), 10) - 1;

    if (selectedCategory === 'Add category') {
      alert('under construction');
    } else {
      const updatedTransactions = transactions.map((transaction, i) =>
        i === index
          ? { ...transaction, category: selectedCategory }
          : transaction
      );

      const filteredTransactions = updatedTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === transactionMonth;
      });

      const q = query(
        collection(db, `transaction_data_${currentYear}`),
        where('uid', '==', user.uid),
        where('account_number', '==', props.account)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          [monthNames[transactionMonth]]: JSON.stringify(filteredTransactions),
        });
      }

      setTransactions(updatedTransactions);
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

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = parseInt(event.target.value);
    setCurrentYear(selectedYear);
    setCurrentMonth(new Date(currentMonth.setFullYear(selectedYear)));
    display();
  };

  const fetchAvailableYears = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const years: number[] = [];

      // Adjust this range based on your needs
      for (let year = 2000; year <= currentYear; year++) {
        const q = query(
          collection(db, `transaction_data_${year}`),
          where('uid', '==', user.uid),
          where('account_number', '==', props.account)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          years.push(year);
        }
      }

      setYearsWithData(years);
    } catch (error) {
      console.error('Error fetching years with data:', error);
    }
  };

  return (
    <div className={styles.mainPage}>
      <div className={styles.header}>
        <div className={styles.monthNavigation}>
          <button className={styles.navButton} onClick={handlePrevYear}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 'calc(1.4rem * var(--font-size-multiplier))',
                alignContent: 'center',
                display: 'flex',
              }}
            >
              arrow_back_ios
            </span>
          </button>
          <span className={styles.yearDisplay}>
            <select
              className={styles.dateDropdown}
              value={currentYear}
              onChange={handleYearChange}
            >
              {props.availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </span>

          <button className={styles.navButton} onClick={handleNextYear}>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 'calc(1.4rem * var(--font-size-multiplier))',
                alignContent: 'center',
                display: 'flex',
              }}
            >
              arrow_forward_ios
            </span>
          </button>
        </div>
        <div className={styles.balanceInfo}>
          Balance: {formatCurrency(balance)}
          <p className={styles.moneyInfo}>
            Money In: {formatCurrency(moneyIn)}
          </p>
          <p className={styles.moneyInfo}>
            Money Out: {formatCurrency(moneyOut)}
          </p>
        </div>
      </div>

      {balance !== null && (
        <div className={styles.transactionsList}>
          {transactions.length > 0 && (
            <div className={styles.transactions}>
              <br />
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className={styles.transactionCard}
                  style={{
                    borderLeft:
                      transaction.amount >= 0
                        ? '15px solid #8EE5A2'
                        : '15px solid var(--primary-1)',
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
                      className={`${styles.categoryDropdown} ${getCategoryStyle(
                        transaction.category
                      )}`}
                      onChange={(event) => handleChange(event, index)}
                      id={`${transaction.date}-${transaction.description}`}
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

export default AllTransactionsView;
