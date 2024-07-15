import React from 'react';
import styles from './RadialProgress.module.css';

interface RadialProgressProps {
  percentage: number;
  label: string;
}

const RadialProgress: React.FC<RadialProgressProps> = ({ percentage, label }) => {
  const radius = 150;
  const stroke = 15;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={styles.radialProgress}>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="white"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="grey"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset: circumference }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className={styles.label}>
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
};

export default RadialProgress;
