'use client';
import styles from './settings.module.css';

/* eslint-disable-next-line */
export interface SettingsProps {}

export function Settings(props: SettingsProps) {

  const handleDeleteAccount = () => {
    // Implement the logic to delete the account here
    alert('Account deleted!');
  };

  return (
    <div className={styles['container']}>
      <button className={styles.deleteButton} onClick={handleDeleteAccount}>
        <div className={styles.settingsTitle}>Delete Account</div>
      </button>
    </div>
  );
}

export default Settings;
