import React from 'react';
import styles from './HealthBar.module.css';

interface HealthBarProps {
  progress: number; // Progress percentage from 0 to 100
}

const HealthBar: React.FC<HealthBarProps> = ({ progress }) => {
  return (
    <div className={styles.healthBarContainer}>
      <span className={styles.label}>Bad</span>
      <div className={styles.bar}>
        <div
          className={styles.fill}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className={styles.label}>Good</span>
    </div>
  );
};

export default HealthBar;
