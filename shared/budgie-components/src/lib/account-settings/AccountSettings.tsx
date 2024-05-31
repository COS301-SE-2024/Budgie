'use client';
import styles from './AccountSettings.module.css';
import "../../root.css";
import React, { useState } from 'react';

/* eslint-disable-next-line */
export interface AccountSettingsProps {
  onClose: () => void;
}

export function AccountSettings(props: AccountSettingsProps) {
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
  return <div className='mainPage'>
  <div className='pageTitle'>
      <span className="material-symbols-outlined" onClick={props.onClose} style={{ marginRight: "0.5rem",fontSize: "1.5rem"}}>arrow_back</span>
      Account Settings
  </div>
  <div className={styles.settingsOptionsContainer}>
    <div className={styles.settingsOption}>
      <p className={styles.settingTitle}>Profile Information</p>
      <p className={styles.settingDescription}>Edit your profile information.</p>
    </div>
    <div className={styles.settingsOption}>
      <p className={styles.settingTitle}>Password Management</p>
      <p className={styles.settingDescription}>Change your password.</p>
    </div>
    <div className={styles.settingsOption}>
      <p className={styles.settingTitle}>Delete Account</p>
      <p className={styles.settingDescription}>Click the button below to start deleting your account. Learn about out deletion policy here.</p>
      <button className={styles.deleteButton} onClick={handleDeleteClick}>
        <div className={styles.deleteButton}>Delete Account</div>
      </button>
      {isPopupVisible && (
        <div className= {styles.popupOverlay}>
          <div className={styles.popupContent}>
            <p>Type in your password to confirm account deletion:</p>
            <input
              type="password"
              placeholder="Enter your password"
              style={{paddingLeft: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', height: '2.5rem', width: '70%'}}
            />
            <button className={styles.confirmButton} onClick={handleConfirmDelete}>
              Confirm
            </button>
            <br></br>
            <button className={styles.cancelButton} onClick={handleClosePopup}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>;
}

export default AccountSettings;

