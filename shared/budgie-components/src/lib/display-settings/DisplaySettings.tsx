'use client';

import styles from './DisplaySettings.module.css';
import "../../root.css";

/* eslint-disable-next-line */
export interface DisplaySettingsProps {
    onClose: () => void;
}

export function DisplaySettings(props: DisplaySettingsProps) {
    const setLight = () => {
        document.documentElement.setAttribute('data-theme', 'light');
    };

    const setDark = () => {
        document.documentElement.setAttribute('data-theme', 'dark');
    };

    return <div className='mainPage'>
        <div className='pageTitle'>
            <span className="material-symbols-outlined" onClick={props.onClose} style={{ marginRight: "0.5rem",fontSize: "1.5rem"}}>arrow_back</span>
            Display Settings
        </div>
        <div className={styles.settingsOptionsContainer}>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Font Size</p>
          <p className={styles.settingDescription}>Edit your profile information or change your password.</p>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Colour</p>
          <p className={styles.settingDescription}>Change the website’s font size, colour, and background.</p>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Background</p>
          <div className={styles.optionContainer}>
            <p className={styles.lightThemeOption} onClick={setLight}>Light</p>
            <p className={styles.darkThemeOption} onClick={setDark}>Dark</p>
          </div>          
        </div>
      </div>
    </div>;
}

export default DisplaySettings;
