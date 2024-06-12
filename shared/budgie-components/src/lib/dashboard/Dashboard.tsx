'use client';
import React, { useState, useEffect } from 'react';
import UploadStatementCSV from '../upload-statement-csv/UploadStatementCSV';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from 'firebase/auth';
import '../../root.css';
import styles from './Dashboard.module.css';
import Metrics from '../metrics/Metrics'; // Import the Metrics component

export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userID, setUserID] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false); // State to control modal visibility

  interface Transaction {
    date: string;
    amount: number;
    balance: number;
    description: string;
  }

  useEffect(() => {
    const getBankStatementsByUserId = async (userId: string) => {
      try {
        const bankStatementsRef = collection(db, 'bankStatements');
        const q = query(bankStatementsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const transactionsData: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          transactionsData.push({
            date: userData.Date,
            amount: parseFloat(userData.Amount),
            balance: parseFloat(userData.Balance),
            description: userData.Description,
          });
        });

        // Sort transactions by date in descending order
        transactionsData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        if (transactionsData.length > 0) {
          setBalance(transactionsData[0].balance); // Assuming the most recent balance is what you need
        }

        setTransactions(transactionsData);
      } catch (error) {
        alert(error);
      }
    };

    const auth = getAuth();
    if (auth) {
      const user = auth.currentUser;
      if (user !== null) {
        setUserID(user.uid);
        getBankStatementsByUserId(user.uid);
      }
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const lines = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);

      // Find the line that contains the balance
      const balanceLine = lines.find((line) => line.startsWith('Balance:'));
      if (balanceLine) {
        const balanceValues = balanceLine
          .split(',')
          .map((value) => value.trim())
          .filter((value) => value);
        if (balanceValues.length > 1) {
          const balance = parseFloat(balanceValues[1]);
          setBalance(balance);
        }
      }

      // Find the line that contains the transaction headers
      const headerLine = lines.find((line) => line.startsWith('Date'));
      if (headerLine) {
        const transactionsData: Transaction[] = transactions;
        const addTransactions: Transaction[] = [];
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
            description,
          };
          transactionsData.push(transaction);
          addTransactions.push(transaction);
        }
        transactionsData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(transactionsData);
        for (let i = 0; i < transactions.length; i++) {
          // Add the transaction to Firestore
          try {
            await addDoc(collection(db, 'bankStatements'), {
              Amount: addTransactions[i].amount,
              Balance: addTransactions[i].balance,
              Date: addTransactions[i].date,
              Description: addTransactions[i].description,
              userId: userID, // Add the userId to the document
            });
          } catch (error) {
            console.error('Error adding document: ', error);
          }
        }
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
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        border: '1px solid var(--main-text)',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        border: '1px solid var(--main-text)',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        border: '1px solid var(--main-text)',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      Balance
                    </th>
                    <th
                      style={{
                        border: '1px solid var(--main-text)',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          border: '1px solid var(--main-text)',
                          padding: '8px',
                        }}
                      >
                        {transaction.date}
                      </td>
                      <td
                        style={{
                          border: '1px solid var(--main-text)',
                          padding: '8px',
                        }}
                      >
                        {transaction.amount}
                      </td>
                      <td
                        style={{
                          border: '1px solid var(--main-text)',
                          padding: '8px',
                        }}
                      >
                        {transaction.balance}
                      </td>
                      <td
                        style={{
                          border: '1px solid var(--main-text)',
                          padding: '8px',
                        }}
                      >
                        {transaction.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <button onClick={() => setShowMetrics(true)} className={styles.metricsButton}>
        View Metrics
      </button>
      {showMetrics && <Metrics onClose={() => setShowMetrics(false)} />}
    </div>
  );
}

export default Dashboard;
