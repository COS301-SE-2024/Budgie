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
} from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import '../../root.css';
import { json } from 'stream/consumers';
import Metrics from '../metrics/Metrics'; // Import the Metrics component

export interface AllTransactionsViewProps {}

export function AllTransactionsView(props: AllTransactionsViewProps) {
  const [balance, setBalance] = useState(0);
  const [moneyIn, setMoneyIn] = useState(0);
  const [moneyOut, setMoneyOut] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [Data, setData] = useState<any>(null);
  const [showMetrics, setShowMetrics] = useState(false); // State to control modal visibility
  const [viewMode, setViewMode] = useState('all');
  const user = useContext(UserContext);

  interface Transaction {
    date: string;
    amount: number;
    balance: number;
    description: string;
    category: string;
  }

  const handleNextYear = () => {
    const Now = new Date();
    if(Now.getFullYear()!=currentYear){
      setCurrentYear(currentYear+1)
      display();
    }
  };

  const handlePrevYear = () => {
   setCurrentYear(currentYear-1)
   display();
  };

  const formatMonthYear = (date: any) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  function getUniqueYearMonths(DataLines: string[]): Record<string, string[]> {
    const yearMonthsRecord: Record<string, Set<string>> = {};

    for (const line of DataLines) {
      const [date] = line.split(',');
      const [year, month] = date.split('/');
      const yearMonth = `${year}/${month}`;

      if (!yearMonthsRecord[year]) {
        yearMonthsRecord[year] = new Set();
      }

      yearMonthsRecord[year].add(yearMonth);
    }

    const result: Record<string, string[]> = {};

    for (const year in yearMonthsRecord) {
      result[year] = Array.from(yearMonthsRecord[year]);
    }

    return result;
  }

  function getSeparateYearMonthsAsTransactionObjects(
    DataLines: string[]
  ): Record<string, Transaction[]> {
    const linesByYearMonth: Record<string, Transaction[]> = {};

    for (const line of DataLines) {
      const [date, amountStr, balanceStr, description] = line
        .split(',')
        .map((part) => part.trim());
      const [year, month] = date.split('/');
      const yearMonth = `${year}/${month}`;
      const amount: number = parseFloat(amountStr);
      const balance: number = parseFloat(balanceStr);

      const transaction: Transaction = {
        date,
        amount,
        balance,
        description,
        category: '', // Initialize category as an empty string
      };

      if (!linesByYearMonth[yearMonth]) {
        linesByYearMonth[yearMonth] = [];
      }

      linesByYearMonth[yearMonth].push(transaction);
    }

    return linesByYearMonth;
  }

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

  function getMonthName(month: string): string {
    const monthIndex = parseInt(month, 10) - 1; // Months are zero-based
    if (monthIndex >= 0 && monthIndex < 12) {
      return monthNames[monthIndex];
    } else {
      throw new Error('Invalid month value');
    }
  }

  function isDuplicate(
    transaction1: Transaction,
    transaction2: Transaction
  ): boolean {
    return (
      transaction1.date === transaction2.date &&
      transaction1.amount === transaction2.amount &&
      transaction1.balance === transaction2.balance &&
      transaction1.description === transaction2.description
    );
  }

  async function MergeTransactions(
    YearMonthLinesRecord: Record<string, Transaction[]>,
    UniqueYearMonths: Record<string, string[]>
  ) {
    //determine merged record
    for (const Year in UniqueYearMonths) {
      let Merged: Record<string, Transaction[]> = {};
      const YearMonths: string[] = UniqueYearMonths[Year];

      //check if doc exists for year by retrieving it
      const docRef = doc(db, `transaction_data_${Year}`, `${user.uid}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        for (const YearMonth of YearMonths) {
          let [Y, Month] = YearMonth.split('/');
          Month = getMonthName(Month);
          if (docSnap.data()[Month]) {
            //month already contains data
            const Incoming: Transaction[] = JSON.parse(docSnap.data()[Month]);
            const Outgoing: Transaction[] = YearMonthLinesRecord[YearMonth];
            //merge data duplicate removal
            const filteredOutgoing = Outgoing.filter(
              (outgoingTransaction) =>
                !Incoming.some((incomingTransaction) =>
                  isDuplicate(outgoingTransaction, incomingTransaction)
                )
            );

            if (filteredOutgoing.length != 0) {
              //there are some non duplicates merge and sort and update
              const combinedTransactions = [...Incoming, ...filteredOutgoing];
              combinedTransactions.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);

                return dateB.getTime() - dateA.getTime();
              });
              const TransactionString = JSON.stringify(combinedTransactions);
              try {
                const Ref = doc(db, `transaction_data_${Y}`, `${user.uid}`);
                await updateDoc(Ref, {
                  [Month]: TransactionString,
                });
              } catch (error) {
                console.log(error);
              }
            }
          } else {
            //empty month can just merge
            const Outgoing: Transaction[] = YearMonthLinesRecord[YearMonth];
            Outgoing.sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);

              return dateB.getTime() - dateA.getTime();
            });
            const TransactionString = JSON.stringify(Outgoing);
            try {
              const Ref = doc(db, `transaction_data_${Y}`, `${user.uid}`);
              await updateDoc(Ref, {
                [Month]: TransactionString,
              });
            } catch (error) {
              console.log(error);
            }
          }
        }
        //call categorize function
        const functions = getFunctions();
        const categoriseExpenses = httpsCallable(
          functions,
          'categoriseExpenses'
        );
        console.log('first run');
        categoriseExpenses({ year: Year });
      } else {
        //documents do not exist for this year can safely add to merged
        for (const YearMonth of YearMonths) {
          Merged[YearMonth] = YearMonthLinesRecord[YearMonth];
        }
        // TODO: sort merged on date
        for (const YearMonth in Merged) {
          const AllTransactions: Transaction[] = Merged[YearMonth];
          AllTransactions.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            return dateB.getTime() - dateA.getTime();
          });
        }
        //upload merged!document does not exist must first set then update
        let first = true;
        for (const YearMonth in Merged) {
          let [year, month] = YearMonth.split('/');
          const TransactionString = JSON.stringify(Merged[YearMonth]);
          const TransactionMonthString = getMonthName(month);
          if (first) {
            first = false;
            await setDoc(doc(db, `transaction_data_${year}`, `${user.uid}`), {
              [TransactionMonthString]: TransactionString,
            });
          } else {
            try {
              const Ref = doc(db, `transaction_data_${year}`, `${user.uid}`);
              await updateDoc(Ref, {
                [TransactionMonthString]: TransactionString,
              });
            } catch (error) {
              console.log(error);
            }
          }
        }
        //call categorize function
        const functions = getFunctions();
        const categoriseExpenses = httpsCallable(
          functions,
          'categoriseExpenses'
        );
        console.log('first run');
        categoriseExpenses({ year: Year });
      }
    }
    setTransactions([]);
  }

  const handleCSVUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const lines = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);

      //extract transaction lines
      const HeaderLine = lines.find((line) => line.startsWith('Date'));
      if (HeaderLine) {
        const DataLines = lines.slice(
          lines.indexOf(HeaderLine) + 1,
          lines.length
        );
        const YearMonthLinesRecord: Record<string, Transaction[]> =
          getSeparateYearMonthsAsTransactionObjects(DataLines);
        const UniqueYearMonths: Record<string, string[]> =
          getUniqueYearMonths(DataLines);
        await MergeTransactions(YearMonthLinesRecord, UniqueYearMonths);
      } else {
        //error incorrect csv format
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const getBankStatementsByUserId = async (userId: string) => {
      try {
        const collectionName = `transaction_data_${currentYear}`;
        const docRef = doc(db, collectionName, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Process the document data here
          setData(data);
        } else {
          console.log('No such document!');
          setData(null);
          setTransactions([])
          setBalance(0)
        }
      } catch (error) {
        console.error('Error getting bank statement document:', error);
      }
    };

    const auth = getAuth();
    if (auth) {
      const user = auth.currentUser;
      if (user !== null) {
        getBankStatementsByUserId(user.uid);
      }
    }
  }, [currentYear]);

  useEffect(() => {
    if (Data !== null) {
      display();
    }
  }, [Data]);

  const display = async () => {
    if(Data!=null){
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
        .filter((transaction: { amount: number; }) => transaction.amount > 0)
        .reduce((acc: any, transaction: { amount: any; }) => acc + transaction.amount, 0);

      const moneyOutTotal = transactionsList
        .filter((transaction: { amount: number; }) => transaction.amount < 0)
        .reduce((acc: any, transaction: { amount: any; }) => acc + transaction.amount, 0);

      setMoneyIn(moneyInTotal);
      setMoneyOut(Math.abs(moneyOutTotal)); // moneyOut should be positive for display
    }
    else{
      setTransactions([]);
      setBalance(0);
      setMoneyIn(0);
      setMoneyOut(0);
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    
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
      
      {/* <button
        onClick={() => setShowMetrics(true)}
        className={styles.metricsButton}
      >
        View Metrics
      </button>

      {showMetrics && <Metrics onClose={() => setShowMetrics(false)} />} */}


      <div className={styles.header}>
        <div className={styles.monthNavigation}>
          <button className={styles.navButton} onClick={handlePrevYear}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 'calc(1.4rem * var(--font-size-multiplier))', alignContent:'center', display: 'flex'}}
            >
              arrow_back_ios
            </span>
          </button>
          <span className={styles.yearDisplay}>
            {currentYear}
          </span>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            onClick={handleNextYear}
          />
          <button className={styles.navButton} onClick={handleNextYear}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 'calc(1.4rem * var(--font-size-multiplier))', alignContent:'center', display: 'flex'}}
            >
              arrow_forward_ios
            </span>
          </button>
        </div>

        <UploadStatementCSV onFileUpload={handleCSVUpload} />

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

