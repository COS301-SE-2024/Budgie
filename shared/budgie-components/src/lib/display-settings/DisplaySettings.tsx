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

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const fontSizeValue = parseFloat(rootStyles.getPropertyValue('--font-size-multiplier'));

    const fontSlider = document.getElementById("fontSlider") as HTMLInputElement;
    fontSlider.value = fontSizeValue.toString();
    const handleSliderChange = () => {
        const fontSizeValue = parseFloat(fontSlider.value);
        document.documentElement.style.setProperty('--font-size-multiplier', fontSizeValue.toString());
    };


    fontSlider.addEventListener("input", handleSliderChange);

    return () => {
        fontSlider.removeEventListener("input", handleSliderChange);
    };
}, []);

    const setLight = () => {
      document.documentElement.setAttribute('data-theme', 'light');
      const theme = document.documentElement.getAttribute('colour-theme');
      if (theme == 'dark-blue')
      {
        document.documentElement.setAttribute('colour-theme', 'light-blue');
      }
      else if (theme == 'dark-yellow')
      {
        document.documentElement.setAttribute('colour-theme', 'light-yellow');
      }
      else if (theme == 'dark-pink')
      {
        document.documentElement.setAttribute('colour-theme', 'light-pink');
      }
      else if (theme == 'dark-purple')
      {
        document.documentElement.setAttribute('colour-theme', 'light-purple');
      }
      else if (theme == 'dark-orange')
      {
        document.documentElement.setAttribute('colour-theme', 'light-orange');
      }
      else if (theme == 'dark-green')
      {
        document.documentElement.setAttribute('colour-theme', 'light-green');
      }
    };

    const setDark = () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const theme = document.documentElement.getAttribute('colour-theme');
      if (theme == 'light-yellow')
      {
        document.documentElement.setAttribute('colour-theme', 'dark-yellow');
      }
      else if (theme == 'light-pink')
      {
        document.documentElement.setAttribute('colour-theme', 'dark-pink');
      }
      else if (theme == 'light-purple')
      {
        document.documentElement.setAttribute('colour-theme', 'dark-purple');
      }
      else if (theme == 'light-orange')
      {
        document.documentElement.setAttribute('colour-theme', 'dark-orange');
      }
      else if (theme == 'light-green')
      {
        document.documentElement.setAttribute('colour-theme', 'dark-green');
      }
      else if (theme == 'light-blue')
      {
        document.documentElement.setAttribute('colour-theme', 'dark-blue');
      }
    };

    const setBlue = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const color = theme == 'light'? 'light-blue' : 'dark-blue';
      document.documentElement.setAttribute('colour-theme', color);
    };
    const setYellow = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const color = theme == 'light'? 'light-yellow' : 'dark-yellow';
      document.documentElement.setAttribute('colour-theme', color);
    };
    const setPink = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const color = theme == 'light'? 'light-pink' : 'dark-pink';
      document.documentElement.setAttribute('colour-theme', color);
    };
    const setPurple = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const color = theme == 'light'? 'light-purple' : 'dark-purple';
      document.documentElement.setAttribute('colour-theme', color);
    };
    const setOrange = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const color = theme == 'light'? 'light-orange' : 'dark-orange';
      document.documentElement.setAttribute('colour-theme', color);
    };
    const setGreen = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const color = theme == 'light'? 'light-green' : 'dark-green';
      document.documentElement.setAttribute('colour-theme', color);
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
          <div className={styles.circleContainer}>
            <div className={styles.blueCircle} onClick={setBlue}></div>
            <div className={styles.yellowCircle} onClick={setYellow}></div>
            <div className={styles.pinkCircle} onClick={setPink}></div>
            <div className={styles.purpleCircle} onClick={setPurple}></div>
            <div className={styles.orangeCircle} onClick={setOrange}></div>
            <div className={styles.greenCircle} onClick={setGreen}></div>
          </div>
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
