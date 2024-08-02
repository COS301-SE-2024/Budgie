'use client';
import React, { useState, useContext, useEffect } from 'react';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AllTransactionsView from '../all-transactions-view/AllTransactionsView';
import MonthlyTransactionsView from '../monthly-transactions-view/MonthlyTransactionsView';
import { UserContext } from '@capstone-repo/shared/budgie-components';

import '../../root.css';
import styles from './Dashboard.module.css';

export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {

  const [viewMode, setViewMode] = useState('monthly');
  const user = useContext(UserContext);
  const [accountOptions, setAccountOptions] = useState<{ alias: string, accountNumber: string }[]>([]);
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [Data, setData] = useState<any>(null);
  const [selectedAlias, setSelectedAlias] = useState<string>('');

  useEffect(() => {
    const fetchAliases = async () => {
      try {
        const q = query(collection(db, 'accounts'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const accountOptionsList = querySnapshot.docs.map(doc => ({
          alias: doc.data().alias,
          accountNumber: doc.data().account_number
        }));
        setAccountOptions(accountOptionsList);

        if (accountOptionsList.length > 0) {
          setSelectedAlias(accountOptionsList[0].alias);
          setCurrentAccountNumber(accountOptionsList[0].accountNumber);
        }
      } catch (error) {
        console.error("Error fetching aliases: ", error);
      }
    };

    fetchAliases();
  }, [user.uid]);

  useEffect(() => {
    const getYearlyTransactions = async () => {
      try {
        if (currentAccountNumber) {
          const q = query(collection(db, `transaction_data_${currentYear}`), where('uid', '==', user.uid), where('account_number', '==', currentAccountNumber));
          const querySnapshot = await getDocs(q);
          const transactionList = querySnapshot.docs.map(doc => doc.data());
          setData(transactionList[0]);
        }
      } catch (error) {
        console.error('Error getting bank statement document:', error);
      }
    };

    getYearlyTransactions();
  }, [currentYear, currentAccountNumber, user.uid]);

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    const selectedOption = accountOptions.find(option => option.alias === selected);
    if (selectedOption) {
      setSelectedAlias(selected);
      setCurrentAccountNumber(selectedOption.accountNumber);
      setData(null); // Reset data when dropdown changes
    }
  };

  return (
    <div>
      <div className={styles.topBar}>
        <div></div>{/*spacing div*/}
        <div>
          <button
            className={`${styles.button} ${viewMode === 'all' ? styles.activeButton : ''}`}
            onClick={() => setViewMode('all')}
          >
              Yearly
          </button>
          <button
            className={`${styles.button} ${viewMode === 'monthly' ? styles.activeButton : ''}`}
            onClick={() => setViewMode('monthly')}
          >
            Monthly
          </button>
        </div>
        <select 
          className={styles.accountDropdown}
          value={selectedAlias}
          onChange={handleDropdownChange}
        >
          {accountOptions.map((option, index) => (
            <option key={index} value={option.alias}>
              {option.alias}
            </option>
          ))}
        </select>
      </div>

      <div>
        {viewMode === 'monthly' && Data ? 
          (<MonthlyTransactionsView account={currentAccountNumber} data={Data} />) : 
        viewMode === 'all' && Data ? 
          (<AllTransactionsView account={currentAccountNumber} />) : 
        (<div className={styles.loadScreen}>Loading...</div>)
        }
      </div>
    </div>
  );
}

export default Dashboard;
