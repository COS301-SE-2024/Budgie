'use client';

import styles from './navbar.module.css';

/* eslint-disable-next-line */
export interface NavbarProps {}

export function Navbar(props: NavbarProps) {
    return <>
    <div className={styles.sidebar}>
            <ul className={styles.navList}>
                <li className={styles.navItem}>Home</li>
                <li className={styles.navItem}>Dashboard</li>
                <li className={styles.navItem}>Settings</li>
                <li className={styles.navItem}>Logout</li>
            </ul>
        </div>
    </>
}

export default Navbar;
