import React, { useState, useEffect } from 'react';
import UploadStatementCSV from '../upload-statement-csv/UploadStatementCSV';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';

export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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
            description: userData.Description
          });
        });

        // Sort transactions by date in descending order
        transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (transactionsData.length > 0) {
          setBalance(transactionsData[0].balance); // Assuming the most recent balance is what you need
        }

        setTransactions(transactionsData);
      } catch (error) {
        alert(error);
      }
    };

    const userId = "j1GNrQWu8jamNoOFhdrZ67"; 
    getBankStatementsByUserId(userId);
  }, []);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
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
          transactionsData.push({
            date,
            amount: parseFloat(amount),
            balance: parseFloat(balance),
            description
          });
        }

        // Sort transactions by date in descending order
        transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTransactions(transactionsData);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className='mainPage'>
      <span className='pageTitle'>Dashboard</span>
      <UploadStatementCSV onFileUpload={handleFileUpload} />
      <br/>
      {balance !== null && (
        <div className='balanceDisplay'>
          <h1><strong>Current Balance:</strong> {balance}</h1>
          <br/>
          {transactions.length > 0 && (
            <div className='transactionHistory'>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Date</th>
                    <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Amount</th>
                    <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Balance</th>
                    <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{transaction.date}</td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{transaction.amount}</td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{transaction.balance}</td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>{transaction.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
