'use client';

import { useState } from 'react';
import styles from './navbar.module.css';


/* eslint-disable-next-line */
export interface NavbarProps {
    onNavigate: (page: string) => void;
    selectedItem: string;
}

export function Navbar(props: NavbarProps) {
   return (
    <div className={styles.sidebar}>
        <ul className={styles.navList}>
            {/* Home item doesn't have an icon */}
            <li className={`${styles.navItem} ${props.selectedItem === 'Home' ? styles.selected : ''}`} onClick={() => props.onNavigate('Home')}>
            <span className="material-symbols-outlined" style={{ marginRight: "0.5rem", marginLeft: "0.5rem",fontSize: "1.2rem",marginBottom: "0.2rem"}}>home</span>
            Home
            </li>
            {/* Dashboard item */}
            <li className={`${styles.navItem} ${props.selectedItem === 'Dashboard' ? styles.selected : ''}`} onClick={() => props.onNavigate('Dashboard')}>
            <span className="material-symbols-outlined" style={{ marginRight: "0.5rem", marginLeft: "0.5rem",fontSize: "1.2rem",marginBottom: "0.2rem"}}>dashboard</span>
                Dashboard
            </li>
            {/* Profile item */}
            <li className={`${styles.navItem} ${props.selectedItem === 'Profile' ? styles.selected : ''}`} onClick={() => props.onNavigate('Profile')}>
            <span className="material-symbols-outlined" style={{ marginRight: "0.5rem", marginLeft: "0.5rem",fontSize: "1.2rem",marginBottom: "0.2rem"}}>account_circle</span>
                Profile
            </li>
            {/* Settings item */}
            <li className={`${styles.navItem} ${props.selectedItem === 'Settings' ? styles.selected : ''}`} onClick={() => props.onNavigate('Settings')}>
            <span className="material-symbols-outlined" style={{ marginRight: "0.5rem", marginLeft: "0.5rem",fontSize: "1.2rem",marginBottom: "0.2rem"}}>settings</span>
                Settings
            </li>
            {/* Logout item */}
            <li className={styles.navItemLogout}>
            <span className="material-symbols-outlined" style={{ marginRight: "0.5rem", marginLeft: "0.5rem",fontSize: "1.2rem"}}>logout</span>
                Logout
            </li>
        </ul>
    </div>
);
}

export default Navbar;
