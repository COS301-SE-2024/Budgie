'use client';
import React, { useEffect } from 'react';
import { useState } from 'react';
import '../../root.css';
import styles from './DisplaySettings.module.css';

/* eslint-disable-next-line */
export interface DisplaySettingsProps {
  onClose: () => void;
}

export function DisplaySettings(props: DisplaySettingsProps) {
  const [selectedCircle, setSelectedCircle] = useState<number | null>(null);
  const [mainTheme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    setTheme('light');

    const rootStyles = getComputedStyle(document.documentElement);
    const colourThemeValue =
      document.documentElement.getAttribute('colour-theme');
    setTheme(document.documentElement.getAttribute('data-theme'));
    let initialCircleIndex = 0;

    if (colourThemeValue === 'dark-blue' || colourThemeValue === 'light-blue') {
      initialCircleIndex = 0;
    } else if (
      colourThemeValue === 'dark-yellow' ||
      colourThemeValue === 'light-yellow'
    ) {
      initialCircleIndex = 1;
    } else if (
      colourThemeValue === 'dark-pink' ||
      colourThemeValue === 'light-pink'
    ) {
      initialCircleIndex = 2;
    } else if (
      colourThemeValue === 'dark-purple' ||
      colourThemeValue === 'light-purple'
    ) {
      initialCircleIndex = 3;
    } else if (
      colourThemeValue === 'dark-orange' ||
      colourThemeValue === 'light-orange'
    ) {
      initialCircleIndex = 4;
    } else if (
      colourThemeValue === 'dark-green' ||
      colourThemeValue === 'light-green'
    ) {
      initialCircleIndex = 5;
    }
    setSelectedCircle(initialCircleIndex);

    const fontSizeValue = parseFloat(
      rootStyles.getPropertyValue('--font-size-multiplier')
    );

    const fontSlider = document.getElementById(
      'fontSlider'
    ) as HTMLInputElement;
    fontSlider.value = fontSizeValue.toString();
    const handleSliderChange = () => {
      const fontSizeValue = parseFloat(fontSlider.value);
      document.documentElement.style.setProperty(
        '--font-size-multiplier',
        fontSizeValue.toString()
      );
    };

    fontSlider.addEventListener('input', handleSliderChange);

    return () => {
      fontSlider.removeEventListener('input', handleSliderChange);
    };
  }, []);

  const setLight = () => {
    setTheme('light');
    document.documentElement.setAttribute('data-theme', 'light');
    const theme = document.documentElement.getAttribute('colour-theme');
    if (theme == 'dark-blue') {
      document.documentElement.setAttribute('colour-theme', 'light-blue');
      setSelectedCircle(0);
    } else if (theme == 'dark-yellow') {
      document.documentElement.setAttribute('colour-theme', 'light-yellow');
      setSelectedCircle(1);
    } else if (theme == 'dark-pink') {
      document.documentElement.setAttribute('colour-theme', 'light-pink');
      setSelectedCircle(2);
    } else if (theme == 'dark-purple') {
      document.documentElement.setAttribute('colour-theme', 'light-purple');
      setSelectedCircle(3);
    } else if (theme == 'dark-orange') {
      document.documentElement.setAttribute('colour-theme', 'light-orange');
      setSelectedCircle(4);
    } else if (theme == 'dark-green') {
      document.documentElement.setAttribute('colour-theme', 'light-green');
      setSelectedCircle(5);
    }
  };

  const setDark = () => {
    setTheme('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    const theme = document.documentElement.getAttribute('colour-theme');
    if (theme == 'light-yellow') {
      document.documentElement.setAttribute('colour-theme', 'dark-yellow');
      setSelectedCircle(1);
    } else if (theme == 'light-pink') {
      document.documentElement.setAttribute('colour-theme', 'dark-pink');
      setSelectedCircle(2);
    } else if (theme == 'light-purple') {
      document.documentElement.setAttribute('colour-theme', 'dark-purple');
      setSelectedCircle(3);
    } else if (theme == 'light-orange') {
      document.documentElement.setAttribute('colour-theme', 'dark-orange');
      setSelectedCircle(4);
    } else if (theme == 'light-green') {
      document.documentElement.setAttribute('colour-theme', 'dark-green');
      setSelectedCircle(5);
    } else if (theme == 'light-blue') {
      document.documentElement.setAttribute('colour-theme', 'dark-blue');
      setSelectedCircle(0);
    }
  };

  const setBlue = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme == 'dark' ? 'dark-blue' : 'light-blue';
    document.documentElement.setAttribute('colour-theme', color);
    setSelectedCircle(0);
  };
  const setYellow = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme == 'dark' ? 'dark-yellow' : 'light-yellow';
    document.documentElement.setAttribute('colour-theme', color);
    setSelectedCircle(1);
  };
  const setPink = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme == 'dark' ? 'dark-pink' : 'light-pink';
    document.documentElement.setAttribute('colour-theme', color);
    setSelectedCircle(2);
  };
  const setPurple = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme == 'dark' ? 'dark-purple' : 'light-purple';
    document.documentElement.setAttribute('colour-theme', color);
    setSelectedCircle(3);
  };
  const setOrange = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme == 'dark' ? 'dark-orange' : 'light-orange';
    document.documentElement.setAttribute('colour-theme', color);
    setSelectedCircle(4);
  };
  const setGreen = () => {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme == 'dark' ? 'dark-green' : 'light-green';
    document.documentElement.setAttribute('colour-theme', color);
    setSelectedCircle(5);
  };

  return (
    <div className="mainPage">
      <div className="pageTitle">
        <span
          className="material-symbols-outlined"
          onClick={props.onClose}
          style={{
            marginRight: '0.8rem',
            fontSize: 'calc(1.5rem * var(--font-size-multiplier))',
          }}
        >
          arrow_back
        </span>
        Display Settings
      </div>
      <div className={styles.settingsOptionsContainer}>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Font Size</p>
          <div className={styles.sliderContainer}>
            <span style={{ marginRight: '1rem', fontSize: '1rem' }}>A</span>
            <input
              type="range"
              id="fontSlider"
              min="1"
              max="2"
              step="0.1"
              className={styles.slider}
            ></input>
            <span style={{ marginLeft: '1rem', fontSize: '2rem' }}>A</span>
          </div>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Colour</p>
          <div className={styles.circleContainer}>
            <div className={styles.blueCircle} onClick={setBlue}>
              {selectedCircle === 0 && <span>✔</span>}
            </div>
            <div className={styles.yellowCircle} onClick={setYellow}>
              {selectedCircle === 1 && <span>✔</span>}
            </div>
            <div className={styles.pinkCircle} onClick={setPink}>
              {selectedCircle === 2 && <span>✔</span>}
            </div>
            <div className={styles.purpleCircle} onClick={setPurple}>
              {selectedCircle === 3 && <span>✔</span>}
            </div>
            <div className={styles.orangeCircle} onClick={setOrange}>
              {selectedCircle === 4 && <span>✔</span>}
            </div>
            <div className={styles.greenCircle} onClick={setGreen}>
              {selectedCircle === 5 && <span>✔</span>}
            </div>
          </div>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Background</p>
          <div className={styles.optionContainer}>
            <p
              className={`${styles.lightThemeOption} ${
                mainTheme === 'light' ? styles.selected : ''
              }`}
              onClick={setLight}
            >
              Light
            </p>
            <p
              className={`${styles.darkThemeOption} ${
                mainTheme === 'dark' ? styles.selected : ''
              }`}
              onClick={setDark}
            >
              Dark
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisplaySettings;
