'use client';
import React, { useState, useContext } from 'react';
import AllTransactionsView from '../all-transactions-view/AllTransactionsView';
import MonthlyTransactionsView from '../monthly-transactions-view/MonthlyTransactionsView';

import '../../root.css';
import styles from './Dashboard.module.css';

export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {

  const [viewMode, setViewMode] = useState('monthly');
  

  return (
    <div>
      <div className={styles.topBar}>
        <button
          className={`${styles.button} ${viewMode === 'all' ? styles.activeButton : ''}`}
          onClick={() => setViewMode('all')}
        >All</button>
        <button
          className={`${styles.button} ${viewMode === 'monthly' ? styles.activeButton : ''}`}
          onClick={() => setViewMode('monthly')}
        >Monthly</button>
      </div>

      {/*Add account options*/}

      <div>
        {viewMode === 'all' ? <AllTransactionsView /> : <MonthlyTransactionsView />}
      </div>
    </div>
  );
}

export default Dashboard;
