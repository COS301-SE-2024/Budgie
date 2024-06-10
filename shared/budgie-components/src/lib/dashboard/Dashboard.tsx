'use client';
import React, { useState, useEffect } from 'react';
import UploadStatementCSV from '../upload-statement-csv/UploadStatementCSV';
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from "firebase/auth";
import "../../root.css";
import styles from './Dashboard.module.css';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../../../apps/budgie-app/firebase/clientApp';


export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userID, setUserID] = useState<string | null>(null);

  interface Transaction {
    date: string;
    amount: number;
    balance: number;
    description: string;
  }

  useEffect(() => {
    const getBankStatementsByUserId = async (userId: string) => {
      // Construct the storage reference using the user ID
    const storageRef = ref(storage, `BankStatements/${userId}`);
  
    try {
      // Get the download URL for the file
      const url = await getDownloadURL(storageRef);
      fetchFileContent(url);
    } catch (error) {
      // Handle errors such as file not found
      console.error('Error fetching bank statement:', error);
    }
    };

    function fetchFileContent(url: string) {
      fetch(url)
        .then(response => response.text())
        .then(data => {
          console.log(data);
          const fileName = 'file.txt'; 
          const file = new File([data], fileName, { type: 'text/plain', lastModified: Date.now() });
          handleFileUpload(file);
        })
        .catch(error => {
          console.error("Error reading file content: ", error);
        });
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (user !== null) {
      setUserID(user.uid);
      getBankStatementsByUserId(user.uid);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);

      // Find the line that contains the balance
      const balanceLine = lines.find(line => line.startsWith('Balance:'));
      if (balanceLine) {
        const balanceValues = balanceLine.split(',').map(value => value.trim()).filter(value => value);
        if (balanceValues.length > 1) {
          const balance = parseFloat(balanceValues[1]);
          setBalance(balance);
        }
      }

      // Find the line that contains the transaction headers
      const headerLine = lines.find(line => line.startsWith('Date'));
      if (headerLine) {
        const transactionsData: Transaction[] = [];
        for (let i = lines.indexOf(headerLine) + 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.trim() === ',,,') {
            break; // Stop reading if encountered an empty line
          }
          const [date, amount, balance, description] = line.split(',');
          const transaction: Transaction = {
            date,
            amount: parseFloat(amount),
            balance: parseFloat(balance),
            description
          };
          transactionsData.push(transaction);
        }
        transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(transactionsData);
        
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mainPage">
      <span className="pageTitle">Dashboard</span>
      <UploadStatementCSV onFileUpload={handleFileUpload} />
      <br />
      {balance !== null && (
        <div className={styles.balance}>
          <h1>
            <strong>Current Balance:</strong> {balance}
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
