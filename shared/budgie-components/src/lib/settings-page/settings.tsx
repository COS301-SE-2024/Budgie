'use client';
import styles from './settings.module.css';
import '../../root.css';
import React, { useState, useEffect } from 'react';
import DisplaySettings from '../display-settings/DisplaySettings';
import AccountSettings from '../account-settings/AccountSettings';
import NotificationSettings from '../notification-settings/notification-settings';
import Support from '../support-page/support';
import { useThemeSettings } from '../../useThemes';

export interface SettingsProps {}

export function Settings(props: SettingsProps) {
  const [currentOverlay, setCurrentOverlay] = useState<string | null>(null);
  const [mainTheme, setTheme] = useState<string | null>(null);

  useThemeSettings();
  const closeOverlay = () => {
    setCurrentOverlay(null);
  };

  return (
    <div className="mainPage">
      <span className="pageTitle">Settings</span>
      <div className={styles.settingsOptionsContainer}>
        <div
          className={styles.settingsOption}
          onClick={() => setCurrentOverlay('Account')}
        >
          <p className={styles.settingTitle}>Account Settings</p>
          <p className={styles.settingDescription}>
            Change your password or delete your account.
          </p>
        </div>
        <div
          className={styles.settingsOption}
          onClick={() => setCurrentOverlay('Display')}
        >
          <p className={styles.settingTitle}>Display Settings</p>
          <p className={styles.settingDescription}>
            Change the website’s font size, colour, and background.
          </p>
        </div>
        {
          <div
            className={styles.settingsOption}
            onClick={() => setCurrentOverlay('Notification')}
          >
            <p className={styles.settingTitle}>Notification Settings</p>
            <p className={styles.settingDescription}>
              Manage email alerts for budget updates, goal progress, and
              spending warnings.
            </p>
          </div>
        }
        <div
          className={styles.settingsOption}
          onClick={() => setCurrentOverlay('Support')}
        >
          <p className={styles.settingTitle}>Support</p>
          <p className={styles.settingDescription}>
            View the help centre or contact us.
          </p>
        </div>
      </div>
      {currentOverlay === 'Account' && (
        <AccountSettings onClose={closeOverlay} />
      )}
      {currentOverlay === 'Display' && (
        <DisplaySettings onClose={closeOverlay} />
      )}
      {currentOverlay === 'Support' && <Support onClose={closeOverlay} />}
      {currentOverlay === 'Notification' && (
        <NotificationSettings onClose={closeOverlay} />
      )}
      {/*currentOverlay === 'General' && <GeneralSettings onClose={closeOverlay} />*/}
    </div>
  );
}

export default Settings;
