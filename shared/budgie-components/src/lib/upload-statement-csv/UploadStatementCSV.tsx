'use client';
import '../../root.css';
import React, { useRef } from 'react';
import styles from './UploadStatementCSV.module.css';

/* eslint-disable-next-line */
export interface UploadStatementCSVProps {
  onFileUpload: (file: File) => void;
}

export function UploadStatementCSV(props: UploadStatementCSVProps) {
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
      event.target.value = '';
    }
  };

  return (
    <div>
      <button className={styles.uploadButton} onClick={handleButtonClick}>
        <div className={styles.uploadButton}>Upload Bank Statement (.csv)</div>
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

export default UploadStatementCSV;
