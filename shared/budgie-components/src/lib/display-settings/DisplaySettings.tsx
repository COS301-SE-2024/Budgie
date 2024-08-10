'use client';
import React, { useEffect, useState } from 'react';
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
    const storedTheme = localStorage.getItem('data-theme') || 'light';
    const storedColourTheme =
      localStorage.getItem('colour-theme') || 'light-blue';
    const storedFontSize = localStorage.getItem('font-size-multiplier') || '1';

    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
    document.documentElement.setAttribute('colour-theme', storedColourTheme);

    const themeIndex = {
      'light-blue': 0,
      'dark-blue': 0,
      'light-yellow': 1,
      'dark-yellow': 1,
      'light-pink': 2,
      'dark-pink': 2,
      'light-purple': 3,
      'dark-purple': 3,
      'light-orange': 4,
      'dark-orange': 4,
      'light-green': 5,
      'dark-green': 5,
    };
    setSelectedCircle(themeIndex[storedColourTheme]);

    // Set font size slider
    const fontSlider = document.getElementById(
      'fontSlider'
    ) as HTMLInputElement;
    fontSlider.value = storedFontSize;
    document.documentElement.style.setProperty(
      '--font-size-multiplier',
      storedFontSize
    );

    const handleSliderChange = () => {
      const fontSizeValue = parseFloat(fontSlider.value);
      document.documentElement.style.setProperty(
        '--font-size-multiplier',
        fontSizeValue.toString()
      );
      localStorage.setItem('font-size-multiplier', fontSizeValue.toString());
    };

    fontSlider.addEventListener('input', handleSliderChange);

    return () => {
      fontSlider.removeEventListener('input', handleSliderChange);
    };
  }, []);

  const updateSettings = (theme: string, colour: string) => {
    setTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('colour-theme', colour);
    localStorage.setItem('data-theme', theme);
    localStorage.setItem('colour-theme', colour);

    const themeIndex = {
      'light-blue': 0,
      'dark-blue': 0,
      'light-yellow': 1,
      'dark-yellow': 1,
      'light-pink': 2,
      'dark-pink': 2,
      'light-purple': 3,
      'dark-purple': 3,
      'light-orange': 4,
      'dark-orange': 4,
      'light-green': 5,
      'dark-green': 5,
    };
    setSelectedCircle(themeIndex[colour]);
  };

  const setLight = () => updateSettings('light', 'light-blue');
  const setDark = () => updateSettings('dark', 'dark-blue');

  const setColor = (color: string) => {
    const theme =
      document.documentElement.getAttribute('data-theme') || 'light';
    updateSettings(theme, color);
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
            />
            <span style={{ marginLeft: '1rem', fontSize: '2rem' }}>A</span>
          </div>
        </div>
        <div className={styles.settingsOption}>
          <p className={styles.settingTitle}>Colour</p>
          <div className={styles.circleContainer}>
            <div
              className={styles.blueCircle}
              onClick={() => setColor('light-blue')}
            >
              {selectedCircle === 0 && <span>✔</span>}
            </div>
            <div
              className={styles.yellowCircle}
              onClick={() => setColor('light-yellow')}
            >
              {selectedCircle === 1 && <span>✔</span>}
            </div>
            <div
              className={styles.pinkCircle}
              onClick={() => setColor('light-pink')}
            >
              {selectedCircle === 2 && <span>✔</span>}
            </div>
            <div
              className={styles.purpleCircle}
              onClick={() => setColor('light-purple')}
            >
              {selectedCircle === 3 && <span>✔</span>}
            </div>
            <div
              className={styles.orangeCircle}
              onClick={() => setColor('light-orange')}
            >
              {selectedCircle === 4 && <span>✔</span>}
            </div>
            <div
              className={styles.greenCircle}
              onClick={() => setColor('light-green')}
            >
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
