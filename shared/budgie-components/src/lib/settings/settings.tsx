'use client';
import styles from './settings.module.css';
import React, { useState } from 'react';

export interface SettingsProps {}

export function Settings(props: SettingsProps) {

  const [isPopupVisible, setPopupVisible] = useState(false);
  const handleDeleteClick = () => {
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
  };
  const handleConfirmDelete = () => {
    // Add logic to delete the account here
    alert('Account deleted!');
    setPopupVisible(false);
  };

  return (
    <div className={styles['container']}>
      <button className={styles.deleteButton} onClick={handleDeleteClick}>
        <div className={styles.settingsTitle}>Delete Account</div>
      </button>
      {isPopupVisible && (
        <div className= {styles.popupOverlay}>
          <div className={styles.popupContent}>
            <p>Are you sure you want to delete your account?</p>
            <button className={styles.confirmButton} onClick={handleConfirmDelete}>
              Yes
            </button>
            <button className={styles.cancelButton} onClick={handleClosePopup}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
