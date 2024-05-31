'use client';
import styles from './settings.module.css';
import "../../root.css";
import React, { useState } from 'react';
import DisplaySettings from '../display-settings/DisplaySettings';
import AccountSettings from '../account-settings/AccountSettings';

export interface SettingsProps {}

export function Settings(props: SettingsProps) {
  const [currentOverlay, setCurrentOverlay] = useState<string | null>(null);

  const closeOverlay = () => {
    setCurrentOverlay(null);
  };

  return (
    <div className='mainPage'>
      <span className='pageTitle'>Settings</span>
      <div className={styles.settingsOptionsContainer}>
        <div className={styles.settingsOption} onClick={() => setCurrentOverlay('Account')}>
          <p className={styles.settingTitle}>Account Settings</p>
          <p className={styles.settingDescription}>Edit your profile information, change your password, or delete your account</p>
        </div>
        <div className={styles.settingsOption} onClick={() => setCurrentOverlay('Display')}>
          <p className={styles.settingTitle}>Display Settings</p>
          <p className={styles.settingDescription}>Change the website’s font size, colour, and background.</p>
        </div>
        <div className={styles.settingsOption} onClick={() => setCurrentOverlay('Notification')}>
          <p className={styles.settingTitle}>Notification Settings</p>
          <p className={styles.settingDescription}>Manage email alerts for budget updates, goal progress, and spending warnings.</p>
        </div>
        <div className={styles.settingsOption} onClick={() => setCurrentOverlay('General')}>
          <p className={styles.settingTitle}>General Settings</p>
          <p className={styles.settingDescription}>Select preferred language, currency, and date and time formats</p>
        </div>
        <div className={styles.settingsOption} onClick={() => setCurrentOverlay('Support')}>
          <p className={styles.settingTitle}>Support</p>
          <p className={styles.settingDescription}>View the help centre or contact us.</p>
        </div>
      </div>
      {currentOverlay === 'Account' && <AccountSettings onClose={closeOverlay} />}
      {currentOverlay === 'Display' && <DisplaySettings onClose={closeOverlay} />}
      {currentOverlay === 'Notification' && <DisplaySettings onClose={closeOverlay} />}
      {currentOverlay === 'General' && <DisplaySettings onClose={closeOverlay} />}
      {currentOverlay === 'Support' && <DisplaySettings onClose={closeOverlay} />}
    </div>
  );
}

export default Settings;
