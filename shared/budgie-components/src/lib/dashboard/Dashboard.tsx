'use client';
import styles from './Dashboard.module.css';
import "../../root.css";
import React, { useRef } from 'react';

/* eslint-disable-next-line */
export interface DashboardProps {
  onFileUpload: (file: File) => void;
}

export function Dashboard(props: DashboardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      props.onFileUpload(file);
    }
  };

  return (
    <div className='mainPage'>
      <span className='pageTitle'>Dashboard</span>
      <button className={styles.uploadButton} onClick={handleButtonClick}>
        <div className={styles.uploadButton}>Upload Bank Statement</div>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Dashboard;
