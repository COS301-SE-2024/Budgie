'use client';
import React, { useState, useContext, useEffect } from 'react';
import AllTransactionsView from '../all-transactions-view/AllTransactionsView';
import MonthlyTransactionsView from '../monthly-transactions-view/MonthlyTransactionsView';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useThemeSettings } from '../../useThemes';

import '../../root.css';
import styles from './Dashboard.module.css';
import { useDataContext } from '../data-context/DataContext';

export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  const { data, loading, refreshData } = useDataContext();
  const user = useContext(UserContext);
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedAlias, setSelectedAlias] = useState<string>('');
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>('');
  const [yearsWithData, setYearsWithData] = useState<number[]>([]);


  useThemeSettings();

  useEffect(() => {
    refreshData();
    const fetchAccounts = async () => {
      if (user && user.uid) {
        if (data.accounts.length > 0) {
          setSelectedAlias(data.accounts[0].alias);
          setCurrentAccountNumber(data.accounts[0].account_number);
        } 
      }
    };

    fetchAccounts();
  }, [user]);

  useEffect(() => {
    const calculateYearsWithData = () => {
      if (data && data.transactions) {
        const years = data.transactions
          .filter(
            (transaction) => transaction.account_number === currentAccountNumber
          )
          .map((transaction) => transaction.year);

          const sortedYears = Array.from(new Set(years)).sort((a, b) => a - b);

        setYearsWithData(sortedYears);
      }
    };

    calculateYearsWithData();
  }, [data.transactions, currentAccountNumber]);

  const handleAccountDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = event.target.value;
    const selectedOption = data.accounts.find(
      (option) => option.alias === selected
    );
    if (selectedOption) {
      setSelectedAlias(selected);
      setCurrentAccountNumber(selectedOption.account_number);
    }
  };

  if (data.accounts.length == 0) {
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
    <div
      className="mainPage flex flex-col w-[85vw] items-center"
      style={{ overflowY: 'hidden', overflowX: 'hidden' }}
    >
      <div className=" flex shadow-lg z-2 justify-between rounded-2xl bg-[var(--block-background)] p-2 w-[98%] m-6">
        <div></div>
        <button
          className={`rounded-sm px-5 hover:bg-opacity-75 hover:bg-BudgieBlue2 hover:text-BudgieWhite font-medium mr-16 cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
            viewMode === 'all' ? 'border-b-4 border-BudgieBlue2' : ''
          }`}
          onClick={() => setViewMode('all')}
        >
          Yearly
        </button>
        <button
          className={`rounded-sm px-5 hover:bg-opacity-75 hover:bg-BudgieBlue2 hover:text-BudgieWhite font-medium cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
            viewMode === 'monthly' ? 'border-b-4 border-BudgieBlue2' : ''
          }`}
          onClick={() => setViewMode('monthly')}
        >
          Monthly
        </button>
        <select
          className={styles.accountDropdown}
          value={selectedAlias}
          onChange={handleAccountDropdownChange}
        >
          {data.accounts.map((option, index) => (
            <option key={index} value={option.alias}>
              {option.alias}
            </option>
          ))}
        </select>
      </div>

      <div>
        {loading ? (
          <div className={styles.loadScreen}>
            <div className={styles.loaderContainer}>
              <div className={styles.loader}></div>
            </div>
            <div className={styles.loaderText}>Loading...</div>
          </div>
        ) : viewMode === 'monthly' ? (
          <MonthlyTransactionsView
            account={currentAccountNumber}
            availableYears={yearsWithData}
          />
        ) : (
          <AllTransactionsView
            account={currentAccountNumber}
            availableYears={yearsWithData}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
