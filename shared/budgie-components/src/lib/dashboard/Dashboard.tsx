'use client';
import React, { useState, useContext, useEffect } from 'react';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AllTransactionsView from '../all-transactions-view/AllTransactionsView';
import MonthlyTransactionsView from '../monthly-transactions-view/MonthlyTransactionsView';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { getAuth } from 'firebase/auth';

import '../../root.css';
import styles from './Dashboard.module.css';

export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {

  const [viewMode, setViewMode] = useState('monthly');
  const user = useContext(UserContext);
  const [aliases, setAliases] = useState<string[]>([]);
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [Data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAliases = async () => {
      try {
        const q = query(collection(db, 'accounts'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const aliasList = querySnapshot.docs.map(doc => doc.data().alias);
        setAliases(aliasList);
        const accountNumberList = querySnapshot.docs.map(doc => doc.data().account_number);
        setCurrentAccountNumber(accountNumberList[0])
        //console.log(currentAccountNumber);
      } catch (error) {
        console.error("Error fetching aliases: ", error);
      }
    };

    fetchAliases();
  });

  useEffect(() => {
    const getYearlyTransactions = async () => {
      try {
        const q = query(collection(db, `transaction_data_${currentYear}`), where('uid', '==', user.uid), where('account_number', '==', currentAccountNumber));
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
    console.log("new");
  }, [currentYear]);

  return (
    <div>
      <div className={styles.topBar}>
        <div></div>{/*spacing div*/}
        <div>
          <button
            className={`${styles.button} ${viewMode === 'all' ? styles.activeButton : ''}`}
            onClick={() => setViewMode('all')}
          >All</button>
          <button
            className={`${styles.button} ${viewMode === 'monthly' ? styles.activeButton : ''}`}
            onClick={() => setViewMode('monthly')}
          >Monthly</button>
        </div>
        <select className={styles.accountDropdown}>
          {aliases.map((alias, index) => (
          <option key={index} value={alias}>
            {alias}
          </option>
          ))}
        </select>
      </div>

      <div>
        {viewMode === 'all' ? <AllTransactionsView /> : <MonthlyTransactionsView account = {currentAccountNumber} data = {Data}/>}
      </div>
    </div>
  );
}

export default Dashboard;
