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
    <div className="mainPage">
      <div className="w-full  flex flex-col items-center justify-center">
        <div className="2xl:w-[85%] w-[100%]  min-w-60">
          <div className="flex shadow-md !z-0 justify-between !bg-BudgieBlue2  rounded-t-2xl bg-[var(--block-background)] w-full sticky top-0">
            <div></div>
            <button
              className={`rounded-sm px-5 hover:bg-opacity-75 text-BudgieWhite font-medium mr-16 cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
                viewMode === 'all' ? 'border-b-4 border-BudgieWhite' : ''
              }`}
              onClick={() => setViewMode('all')}
            >
              Yearly
            </button>
            <button
              className={`rounded-sm px-5 hover:bg-opacity-75 text-BudgieWhite font-medium cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
                viewMode === 'monthly' ? 'border-b-4 border-BudgieWhite ' : ''
              }`}
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </button>
            <select
              className="
                bg-BudgieBlue2
                text-BudgieWhite
                pr-[2.5vw]
                text-[calc(1.2rem*var(--font-size-multiplier))]
                font-bold
                mr-8
                transition
                duration-200
                ease
                border-0
                justify-self-end
                text-right
                [text-align-last: right]
                h-[calc(3rem*var(--font-size-multiplier))]
                leading-[calc(2rem*var(--font-size-multiplier))]
              "
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

          <div className="">
            {loading ? (
              // <div className={styles.loadScreen}>
              //   <div className={styles.loaderContainer}>
              //     <div className={styles.loader}></div>
              //   </div>
              //   <div className={styles.loaderText}>Loading...</div>
              // </div>

              <div className="w-full bg-[var(--main-background)] !z-0">
                <div className="flex justify-between items-center !z-0 !sticky !top-12  bg-BudgieAccentHover py-2 px-4 shadow-md h-16 rounded-b-2xl"></div>
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="text-black flex w-[98%] flex-col items-center justify-center gap-[10px] mt-4">
                    <div className={styles.loadScreen}>
                      <div className={styles.loaderContainer}>
                        <div className={styles.loader}></div>
                      </div>
                      <div className={styles.loaderText}>Loading...</div>
                    </div>
                  </div>
                </div>
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
      </div>
    </div>
  );
}

export default Dashboard;
