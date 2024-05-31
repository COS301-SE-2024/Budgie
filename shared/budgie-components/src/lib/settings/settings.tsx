'use client';
import styles from './settings.module.css';
import "../../root.css";
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
    <div className='mainPage'>
      {/*<button className={styles.deleteButton} onClick={handleDeleteClick}>
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
      )}*/}
      <span className='pageTitle'>Settings</span>
      <div className={styles.settingsOptionsContainer}>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Account Settings</p>
          <p className={styles.settingDescription}>Edit your profile information or change your password.</p>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Display Settings</p>
          <p className={styles.settingDescription}>Change the website’s font size, colour, and background.</p>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Notification Settings</p>
          <p className={styles.settingDescription}>Manage email alerts for budget updates, goal progress, and spending warnings.</p>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>General Settings</p>
          <p className={styles.settingDescription}>Select preferred language, currency, and date and time formats</p>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Support</p>
          <p className={styles.settingDescription}>View the help centre or contact us.</p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
