import styles from './AccountSettings.module.css';

/* eslint-disable-next-line */
export interface AccountSettingsProps {}

export function AccountSettings(props: AccountSettingsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to AccountSettings!</h1>
    </div>
  );
}

export default AccountSettings;
