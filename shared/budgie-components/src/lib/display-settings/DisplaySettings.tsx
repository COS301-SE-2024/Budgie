'use client';
import React, { useEffect } from 'react';
import { useState } from 'react';
import "../../root.css";
import styles from './DisplaySettings.module.css';


/* eslint-disable-next-line */
export interface DisplaySettingsProps {
    onClose: () => void;
}

export function DisplaySettings(props: DisplaySettingsProps) {
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const fontSizeValue = parseFloat(rootStyles.getPropertyValue('--font-size-multiplier'));
    setFontSizeMultiplier(fontSizeValue);

    const fontSlider = document.getElementById("fontSlider") as HTMLInputElement;
    fontSlider.value = fontSizeValue.toString();
    const handleSliderChange = () => {
        const fontSizeValue = parseFloat(fontSlider.value);
        setFontSizeMultiplier(fontSizeValue);
        document.documentElement.style.setProperty('--font-size-multiplier', fontSizeValue.toString());
    };


    fontSlider.addEventListener("input", handleSliderChange);

    return () => {
        fontSlider.removeEventListener("input", handleSliderChange);
    };
}, []);

    const setLight = () => {
        document.documentElement.setAttribute('data-theme', 'light');
    };

    const setDark = () => {
        document.documentElement.setAttribute('data-theme', 'dark');
    };

    return <div className='mainPage'>
        <div className='pageTitle'>
        <span
          className="material-symbols-outlined"
          onClick={props.onClose}
          style={{ marginRight: '0.8rem', fontSize: 'calc(1.5rem * var(--font-size-multiplier))' }}
        >
          arrow_back
        </span>
            Display Settings
        </div>
        <div className={styles.settingsOptionsContainer}>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Font Size</p>        
          <div className={styles.sliderContainer}>
              <span style={{marginRight: "1rem", fontSize: "1rem" }}>A</span>
              <input type="range" id="fontSlider" min="1" max="2" step="0.1" style ={{width: "15rem"}}></input>
              <span style={{ marginLeft: "1rem", fontSize: "2rem" }}>A</span>
          </div>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Colour</p>
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
