'use client';

import styles from './navbar.module.css';
//import { makeStyles } from '@mui/styles';
//import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';

/* eslint-disable-next-line */
export interface NavbarProps {}

export function Navbar(props: NavbarProps) {
    return <>
    <div className={styles.sidebar}>
            <ul className={styles.navList}>
                <li className={styles.navItem}><HomeOutlinedIcon className={styles.navIcon}/>Home</li>
                <li className={styles.navItem}><DashboardOutlinedIcon className={styles.navIcon}/>Dashboard</li>
                <li className={styles.navItem}><PersonOutlinedIcon className={styles.navIcon}/>Profile</li>
                <li className={styles.navItem}><SettingsOutlinedIcon className={styles.navIcon}/>Settings</li>
                <li className={styles.navItemLogout}><ExitToAppOutlinedIcon className={styles.navIcon}/>Logout</li>
                
            </ul>
        </div>
    </>
}

export default Navbar;
