'use client';

import { useState } from 'react';
import styles from './new-navbar.module.css';
import { getAuth, signOut } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

/* eslint-disable-next-line */
export interface NavbarProps {
  // onNavigate: (page: string) => void;
  // selectedItem: string;
}

function signout() {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      console.log('signed out');
    })
    .catch((error) => {
      console.log('error');
    });
}

export function NewNavbar(props: NavbarProps) {
  const pathname = usePathname();
  const [selectedItem, setSelectedItem] = useState<string>(pathname.slice(1));

  return (
    <div className={styles.sidebar}>
      <ul className={styles.navList}>
        {/* Overview item doesn't have an icon */}
        <Link href={'/overview'}>
          <li
            className={`${styles.navItem} ${
              selectedItem === 'overview' ? styles.selected : ''
            }`}
            onClick={() => setSelectedItem('overview')}
          >
            <span
              className="material-symbols-outlined"
              style={{
                marginRight: '0.3rem',
                marginLeft: '0.3rem',
                marginBottom: '0.2rem',
                fontSize:
                  'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))',
              }}
            >
              home
            </span>
            Overview
          </li>
        </Link>
        {/* Accounts item */}
        <Link href={'/accounts'}>
          <li
            className={`${styles.navItem} ${
              selectedItem === 'accounts' ? styles.selected : ''
            }`}
            onClick={() => setSelectedItem('accounts')}
          >
            <span
              className="material-symbols-outlined"
              style={{
                marginRight: '0.3rem',
                marginLeft: '0.3rem',
                marginBottom: '0.2rem',
                fontSize:
                  'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))',
              }}
            >
              dashboard
            </span>
            Accounts
          </li>
        </Link>
        {/* Transactions item */}
        <Link href={'/transactions'}>
          <li
            className={`${styles.navItem} ${
              selectedItem === 'transactions' ? styles.selected : ''
            }`}
            onClick={() => setSelectedItem('transactions')}
          >
            <span
              className="material-symbols-outlined"
              style={{
                marginRight: '0.3rem',
                marginLeft: '0.3rem',
                marginBottom: '0.2rem',
                fontSize:
                  'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))',
              }}
            >
              account_circle
            </span>
            Transactions
          </li>
        </Link>
        {/* Settings item */}
        <Link href={'/settings'}>
          <li
            className={`${styles.navItem} ${
              selectedItem === 'settings' ? styles.selected : ''
            }`}
            onClick={() => setSelectedItem('settings')}
          >
            <span
              className="material-symbols-outlined"
              style={{
                marginRight: '0.3rem',
                marginLeft: '0.3rem',
                marginBottom: '0.2rem',
                fontSize:
                  'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))',
              }}
            >
              settings
            </span>
            Settings
          </li>
        </Link>
        {/* Logout item */}
        <li className={styles.navItemLogout} onClick={signout}>
          <span
            className="material-symbols-outlined"
            style={{
              marginRight: '0.3rem',
              marginLeft: '0.3rem',
              marginBottom: '0.2rem',
              fontSize:
                'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))',
            }}
          >
            logout
          </span>
          Logout
        </li>
      </ul>
    </div>
  );
}

export default NewNavbar;
