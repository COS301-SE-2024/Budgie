'use client';
import styles from '../all-transactions-view/AllTransactionsView.module.css';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query, 
  where
} from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from 'firebase/auth';
import '../../root.css';

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
  const dropdownRef = useRef<HTMLSelectElement>(null);

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
    //can't go passed next month
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
  }, [currentYear]);

  useEffect(() => {
    if (Data !== null) {
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

      const q = query(collection(db, `transaction_data_${currentYear}`), where('uid', '==', user.uid), where('account_number', '==', props.account));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          [monthNames[currentMonth.getMonth()]]: JSON.stringify(updatedTransactions),
        });

        const querySnapshot2 = await getDocs(q);
        const transactionList = querySnapshot2.docs.map(doc => doc.data());
        setData(transactionList[0]);
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

  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const yearOptions = [2020, 2021, 2022, 2023, 2024];
  

  useEffect(() => {
    if (dropdownRef.current) {
      const selectedOption = dropdownRef.current.options[dropdownRef.current.selectedIndex];
      const size = getMonthWidth(selectedOption.text);
      dropdownRef.current.style.width = `${size+20}px`;
    }
  }, [currentMonth]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = event.target.value;
    const monthIndex = monthOptions.indexOf(selectedMonth);
    setCurrentMonth(new Date(currentMonth.setMonth(monthIndex)));
    display();
  };
  
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = parseInt(event.target.value);
    setCurrentYear(selectedYear);
    setCurrentMonth(new Date(currentMonth.setFullYear(selectedYear)));
    display();
  };    

  function getMonthWidth(text: string, font: string = 'calc(1.4rem * var(--font-size-multiplier)) Trip Sans'): number {
    const span = document.createElement('span');
    span.style.font = font;
    span.style.visibility = 'hidden'; // Make it invisible
    span.style.whiteSpace = 'nowrap'; // Prevent wrapping
    span.textContent = text;
    document.body.appendChild(span);
    const width: number = span.offsetWidth;
    document.body.removeChild(span);
    return width;
}

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
            <select
              ref={dropdownRef}
              className={styles.dateDropdown}
              value={monthOptions[currentMonth.getMonth()]}
              onChange={handleMonthChange}
            >
              {monthOptions.map((month, index) => (
                <option key={index} value={month}>{month}</option>
              ))}
            </select>
            
            <select
              className={styles.dateDropdown}
              value={currentYear}
              onChange={handleYearChange}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </span>
          
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
                          className={`${styles.categoryDropdown} ${getCategoryStyle(transaction.category)}`}
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

export default MonthlyTransactionsView;

