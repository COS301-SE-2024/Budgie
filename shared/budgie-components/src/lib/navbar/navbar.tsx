'use client';

import { useState } from 'react';
import styles from './navbar.module.css';


/* eslint-disable-next-line */
export interface NavbarProps {}

export function Navbar(props: NavbarProps) {
    const [selectedItem, setSelectedItem] = useState(''); // State to keep track of the selected item

    const handleItemClick = (itemName: string) => {
        setSelectedItem(itemName); // Update the selected item when clicked
    };

   return (
    <div className={styles.sidebar}>
        <ul className={styles.navList}>
            {/* Home item doesn't have an icon */}
            <li className={`${styles.navItem} ${selectedItem === 'Home' ? styles.selected : ''}`} onClick={() => handleItemClick('Home')}>
            <span className="material-symbols-outlined" style={{ marginRight: "0.5rem", marginLeft: "0.5rem",fontSize: "1.2rem",marginBottom: "0.2rem"}}>home</span>
            Home
            </li>
            {/* Dashboard item */}
            <li className={`${styles.navItem} ${selectedItem === 'Dashboard' ? styles.selected : ''}`} onClick={() => handleItemClick('Dashboard')}>
            <span className="material-symbols-outlined" style={{ marginRight: "0.5rem", marginLeft: "0.5rem",fontSize: "1.2rem",marginBottom: "0.2rem"}}>dashboard</span>
                Dashboard
            </li>
            {/* Profile item */}
            <li className={`${styles.navItem} ${selectedItem === 'Profile' ? styles.selected : ''}`} onClick={() => handleItemClick('Profile')}>
            <span className="material-symbols-outlined" style={{ marginRight: "0.5rem", marginLeft: "0.5rem",fontSize: "1.2rem",marginBottom: "0.2rem"}}>account_circle</span>
                Profile
            </li>
            {/* Settings item */}
            <li className={`${styles.navItem} ${selectedItem === 'Settings' ? styles.selected : ''}`} onClick={() => handleItemClick('Settings')}>
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
