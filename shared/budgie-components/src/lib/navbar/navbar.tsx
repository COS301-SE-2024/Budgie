'use client';

import { useState } from 'react';
import styles from './navbar.module.css';
import { getAuth, signOut } from 'firebase/auth';

/* eslint-disable-next-line */
export interface NavbarProps {
  onNavigate: (page: string) => void;
  selectedItem: string;
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

export function Navbar(props: NavbarProps) {
  return (
    <div className={styles.sidebar}>
      <ul className={styles.navList}>
        {/* Home item doesn't have an icon */}
        <li
          className={`${styles.navItem} ${
            props.selectedItem === 'Home' ? styles.selected : ''
          }`}
          onClick={() => props.onNavigate('Home')}
        >
          <span
            className="material-symbols-outlined"
            style={{
              marginRight: '0.3rem',
              marginLeft: '0.3rem',
              marginBottom: '0.2rem',
              fontSize: 'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))'
            }}
          >
            home
          </span>
          Home
        </li>
        {/* Dashboard item */}
        <li
          className={`${styles.navItem} ${
            props.selectedItem === 'Dashboard' ? styles.selected : ''
          }`}
          onClick={() => props.onNavigate('Dashboard')}
        >
          <span
            className="material-symbols-outlined"
            style={{
              marginRight: '0.3rem',
              marginLeft: '0.3rem',
              marginBottom: '0.2rem',
              fontSize: 'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))'
            }}
          >
            dashboard
          </span>
          Dashboard
        </li>
        {/* Profile item */}
        <li
          className={`${styles.navItem} ${
            props.selectedItem === 'Profile' ? styles.selected : ''
          }`}
          onClick={() => props.onNavigate('Profile')}
        >
          <span
            className="material-symbols-outlined"
            style={{
              marginRight: '0.3rem',
              marginLeft: '0.3rem',
              marginBottom: '0.2rem',
              fontSize: 'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))'
            }}
          >
            account_circle
          </span>
          Profile
        </li>
        {/* Settings item */}
        <li
          className={`${styles.navItem} ${
            props.selectedItem === 'Settings' ? styles.selected : ''
          }`}
          onClick={() => props.onNavigate('Settings')}
        >
          <span
            className="material-symbols-outlined"
            style={{
              marginRight: '0.3rem',
              marginLeft: '0.3rem',
              marginBottom: '0.2rem',
              fontSize: 'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))'
            }}
          >
            settings
          </span>
          Settings
        </li>
        {/* Logout item */}
        <li className={styles.navItemLogout} onClick={signout}>
          <span
            className="material-symbols-outlined"
            style={{
              marginRight: '0.3rem',
              marginLeft: '0.3rem',
              marginBottom: '0.2rem',
              fontSize: 'min(2rem, (calc(1.2rem * var(--font-size-multiplier))))'
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

export default Navbar;
