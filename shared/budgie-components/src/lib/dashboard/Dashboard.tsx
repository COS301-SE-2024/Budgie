'use client';
import styles from './Dashboard.module.css';
import "../../root.css";
import React, { useRef } from 'react';
import UploadStatementCSV from '../upload-statement-csv/UploadStatementCSV';

/* eslint-disable-next-line */
export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  const handleFileUpload = (file: File) => {
  };
  return (
    <div className='mainPage'>
      <span className='pageTitle'>Dashboard</span>
      <UploadStatementCSV onFileUpload={handleFileUpload}/>
    </div>    
  );
}

export default Dashboard;
