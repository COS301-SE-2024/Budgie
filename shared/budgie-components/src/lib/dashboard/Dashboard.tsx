'use client';
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AllTransactionsView from '../all-transactions-view/AllTransactionsView';
import MonthlyTransactionsView from '../monthly-transactions-view/MonthlyTransactionsView';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useThemeSettings } from '../../useThemes';

import '../../root.css';
import styles from './Dashboard.module.css';

export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  const user = useContext(UserContext);
  const [data, setData] = useState<any>(null);
  const [viewMode, setViewMode] = useState('monthly');
  const currentYear = new Date().getFullYear();
  const [accountOptions, setAccountOptions] = useState<
    { alias: string; accountNumber: string }[]
  >([]);
  const [selectedAlias, setSelectedAlias] = useState<string>('');
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>('');
  const [yearsWithData, setYearsWithData] = useState<number[]>([]);
  const [hasAccount, setHasAccount] = useState<'Yes' | 'No' | 'Loading'>(
    'Loading'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoData, setShowNoData] = useState(false);

  useThemeSettings();

  const fetchData = useCallback(async () => {
    if (user && user.uid && currentAccountNumber) {
      setIsLoading(true);
      setError(null);
      setShowNoData(false);
      try {
        // Fetch yearly transactions
        const yearlyQ = query(
          collection(db, `transaction_data_${currentYear}`),
          where('uid', '==', user.uid),
          where('account_number', '==', currentAccountNumber)
        );
        const yearlySnapshot = await getDocs(yearlyQ);
        const yearlyData = yearlySnapshot.docs.map((doc) => doc.data());
        setData(yearlyData[0] || null);

        // Fetch available years
        const years: number[] = [];
        for (let year = 2000; year <= currentYear; year++) {
          const yearQ = query(
            collection(db, `transaction_data_${year}`),
            where('uid', '==', user.uid),
            where('account_number', '==', currentAccountNumber)
          );
          const yearSnapshot = await getDocs(yearQ);
          if (!yearSnapshot.empty) {
            years.push(year);
          }
        }
        setYearsWithData(years);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsLoading(false);
        // Delay showing the "No data" message
        setTimeout(() => {
          setShowNoData(true);
        }, 500); // 500ms delay
      }
    }
  }, [user, currentAccountNumber, currentYear]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user && user.uid) {
        try {
          const q = query(
            collection(db, 'accounts'),
            where('uid', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          const accountOptionsList = querySnapshot.docs.map((doc) => ({
            alias: doc.data().alias,
            accountNumber: doc.data().account_number,
          }));
          setAccountOptions(accountOptionsList);

          if (accountOptionsList.length > 0) {
            setSelectedAlias(accountOptionsList[0].alias);
            setCurrentAccountNumber(accountOptionsList[0].accountNumber);
            setHasAccount('Yes');
          } else {
            setHasAccount('No');
          }
        } catch (error) {
          console.error('Error fetching aliases: ', error);
          setError('Failed to fetch accounts. Please try again later.');
        }
      }
    };

    fetchAccounts();
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccountDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = event.target.value;
    const selectedOption = accountOptions.find(
      (option) => option.alias === selected
    );
    if (selectedOption) {
      setSelectedAlias(selected);
      setCurrentAccountNumber(selectedOption.accountNumber);
      setData(null);
      setShowNoData(false);
    }
  };

  if (hasAccount === 'No') {
    return (
      <div className={styles.noAccountScreen}>
        <div>
          <div className={styles.noAccountText}>
            You haven't added an account yet.
          </div>
          <div className={styles.noAccountText}>
            Head to the Accounts page to add an account and upload a transaction
            statement.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.topBar}>
        <div></div>
        <div>
          <button
            className={`${styles.button} ${
              viewMode === 'all' ? styles.activeButton : ''
            }`}
            onClick={() => setViewMode('all')}
          >
            Yearly
          </button>
          <button
            className={`${styles.button} ${
              viewMode === 'monthly' ? styles.activeButton : ''
            }`}
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
        {isLoading ? (
          <div className={styles.loadScreen}>
            <div className={styles.loaderContainer}>
              <div className={styles.loader}></div>
            </div>
            <div className={styles.loaderText}>Loading...</div>
          </div>
        ) : error ? (
          <div className={styles.errorScreen}>
            <div className={styles.errorText}>{error}</div>
          </div>
        ) : viewMode === 'monthly' && data && yearsWithData.length > 0 ? (
          <MonthlyTransactionsView
            account={currentAccountNumber}
            data={data}
            availableYears={yearsWithData}
          />
        ) : viewMode === 'all' && yearsWithData.length > 0 ? (
          <AllTransactionsView
            account={currentAccountNumber}
            availableYears={yearsWithData}
          />
        ) : showNoData ? (
          <div className={styles.noDataScreen}>
            <div className={styles.noDataText}>
              No transaction data available for the selected account.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Dashboard;
