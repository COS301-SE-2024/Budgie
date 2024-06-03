'use client';

import React, { useState } from 'react';
import UploadStatementCSV from '../upload-statement-csv/UploadStatementCSV';
// @ts-ignore
import { processFileContent } from './DashBoardHook.js';

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

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { balance, transactionsData } = processFileContent(content);
      setBalance(balance);
      setTransactions(transactionsData);
    };

    reader.readAsText(file);
  };

  return (
    <div className="mainPage">
      <span className="pageTitle">Dashboard</span>
      <UploadStatementCSV onFileUpload={handleFileUpload} />
      <br />
      {balance !== null && (
        <div className="balanceDisplay">
          <h1>
            <strong>Current Balance:</strong> {balance}
          </h1>
          <br />
          {transactions.length > 0 && (
            <div className="transactionHistory">
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        border: '1px solid black',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        border: '1px solid black',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        border: '1px solid black',
                        padding: '8px',
                        textAlign: 'left',
                      }}
                    >
                      Balance
                    </th>
                    <th
                      style={{
                        border: '1px solid black',
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
                      <td style={{ border: '1px solid black', padding: '8px' }}>
                        {transaction.date}
                      </td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>
                        {transaction.amount}
                      </td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>
                        {transaction.balance}
                      </td>
                      <td style={{ border: '1px solid black', padding: '8px' }}>
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
    </div>
  );
}

export default Dashboard;
