'use client';
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
import { getAuth } from "firebase/auth";
import '../../root.css';
import styles from './Dashboard.module.css';
import { Merge } from '@mui/icons-material';
import { json } from 'stream/consumers';

export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date());
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
    // const today = new Date();
    // const nextMonth = new Date(currentMonth);
    // nextMonth.setMonth(nextMonth.getMonth() + 1);
    // const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    // if (nextMonth.getTime() <= startOfNextMonth.getTime()) {
    //   setCurrentMonth(nextMonth);
    //   display();
    // } 
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
    display(); 
    
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    display();
  };

  const formatMonthYear = (date : any) => {
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

  function getMonthName(month: string): string {
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
      } else {
        //documents do not exist for this year can safely add to merged
        for (const YearMonth of YearMonths) {
          Merged[YearMonth] = YearMonthLinesRecord[YearMonth];
        }
        // TODO: sort merged on date
        for (const YearMonth in Merged) {
          const MonthlyTransactions: Transaction[] = Merged[YearMonth];
          MonthlyTransactions.sort((a, b) => {
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
      }
    }
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
        const docRef = doc(db, 'transaction_data_2024', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Process the document data here
          setData(data);          
          
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error getting bank statement document:', error);
      }
    };

    const auth = getAuth();
    const user = auth.currentUser;
    if (user !== null) {
      getBankStatementsByUserId(user.uid)
    }  

  },[currentYear] );

  useEffect(() => {
    if(Data!==null){
      display()
    }
  }, [Data])


  const display = async () => {
    const month = currentMonth.toLocaleString('default', { month: 'long' }).toLocaleLowerCase();
    if(Data[month]===undefined){
      setTransactions([])
      setBalance(0)
    }
    else{
      setTransactions(JSON.parse(Data[month]));
      setBalance((JSON.parse(Data[month]))[0].balance)
    }
  }


  return (
    <div className="mainPage">
      <div className="header">
        <span className="pageTitle">Dashboard</span>
        <UploadStatementCSV onFileUpload={handleCSVUpload} />
      </div>
      <div className="monthNavigation">
        <br/>
        <button className="navButton" onClick={handlePrevMonth}>
        <span 
            className="material-symbols-outlined">
            arrow_back_ios
          </span> 
        </button>
        <span className="monthDisplay">{formatMonthYear(currentMonth)}</span>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" onClick={handleNextMonth}/>
        <button className="navButton" onClick={handleNextMonth}>
          <span 
            className="material-symbols-outlined">
            arrow_forward_ios
          </span>
        </button>
      </div>
      <br />
            {balance !== null && (
        <div className={styles.balance}>
          <h1>
            <strong>Balance:</strong> {balance}
          </h1>
          <br />
          {transactions.length > 0 && (
            <div className={styles.transactions}>
            {transactions.map((transaction, index) => (
              <div key={index} className={styles.transactionCard} style={{ borderLeft: transaction.amount >= 0 ? '10px solid #293652' : '10px solid #9e9e9e' }}>
                <div className={styles.transactionItem}>
                  <div className={styles.transactionContent}>
                    <div className={styles.transactionDateTime}>
                      <div className={styles.transactionDate}>{transaction.date}</div>
                      <div className={styles.transactionDescription}>{transaction.description}</div>
                    </div>
                    <div className={styles.transactionAmount}>{transaction.amount}</div>
                  </div>
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

export default Dashboard;
