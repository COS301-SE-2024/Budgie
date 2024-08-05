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

  const user = useContext(UserContext);
  const [Data, setData] = useState<any>(null);

  // Yearly or monthly view
  const [viewMode, setViewMode] = useState('monthly');
  
  // Default year is the current year
  const currentYear = new Date().getFullYear();

  // Current user's available accounts
  const [accountOptions, setAccountOptions] = useState<{ alias: string, accountNumber: string }[]>([]);
  
  // Alias and account number of the currently selected account
  const [selectedAlias, setSelectedAlias] = useState<string>('');
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>('');

  // Set of years for which user has transactions
  const [yearsWithData, setYearsWithData] = useState<number[]>([0]);

  const [hasAccount, setHasAccount] = useState('No');

  useEffect(() => {
    const fetchAccounts = async () => {
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
          setHasAccount("Yes");
        }
        else{
          setHasAccount("No");
        }
      } catch (error) {
        console.error("Error fetching aliases: ", error);
      }
    };

    fetchAccounts();
  }, []);

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

  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];
        
        for (let year = 2000; year <= currentYear; year++) {
          const q = query(collection(db, `transaction_data_${year}`), where('uid', '==', user.uid), where('account_number', '==', currentAccountNumber));
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

    fetchAvailableYears();
  }, [currentAccountNumber]);

  const handleAccountDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    const selectedOption = accountOptions.find(option => option.alias === selected);
    if (selectedOption) {
      setSelectedAlias(selected);
      setCurrentAccountNumber(selectedOption.accountNumber);
      setData(null);
    }
  };

  return (
    <div>
      {hasAccount==="No" ? 
          (<div className={styles.noAccountScreen}>
            <div>
              <div className={styles.noAccountText}>
                You haven't added an account yet.
              </div>
              <div className={styles.noAccountText}>
                Head to the Accounts page to add an account and upload a transaction statement.  
              </div>   
            </div>  
          </div>)
      
      : (<div><div className={styles.topBar}>
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
          onChange={handleAccountDropdownChange}
        >
          {accountOptions.map((option, index) => (
            <option key={index} value={option.alias}>
              {option.alias}
            </option>
          ))}
        </select>
      </div>

      <div>
        {viewMode === 'monthly' && Data && yearsWithData[0]!==0  ? 
        (<MonthlyTransactionsView account={currentAccountNumber} data={Data} availableYears={yearsWithData}/>) 

        : viewMode === 'all' && Data && yearsWithData[0]!==0  ? 
          (<AllTransactionsView account={currentAccountNumber} availableYears={yearsWithData}/>) 

        : (<div className={styles.loadScreen}>
            <div className={styles.loaderContainer}>
              <div className={styles.loader}></div>
            </div> 
            <div className={styles.loaderText}>Loading...</div>            
          </div>)
        }
      </div>
      </div>)
      }
    </div>
  );
}

export default Dashboard;
