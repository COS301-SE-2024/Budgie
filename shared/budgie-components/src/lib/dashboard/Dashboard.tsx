'use client';
import styles from './Dashboard.module.css';
import "../../root.css";

/* eslint-disable-next-line */
export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  return (
    <div className='mainPage'>
      <span className='pageTitle'>Dashboard</span>
    </div>
  );
}

export default Dashboard;
