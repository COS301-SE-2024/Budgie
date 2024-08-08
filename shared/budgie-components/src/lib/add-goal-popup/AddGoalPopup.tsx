import React, { useState } from 'react';
import styles from './AddGoalPopup.module.css';
import '../../root.css';

/* eslint-disable-next-line */
export interface AddGoalPopupProps {
  togglePopup: () => void;
}

export function AddGoalPopup(props: AddGoalPopupProps) {
  const [activeTab, setActiveTab] = useState<string>('Savings');

  return (
    <div className={styles.addGoalPopup}>
      <div className={styles.popupContainer}>
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('Savings')}
            className={activeTab === 'Savings' ? `${styles.active} ` : ''}
          >
            Savings
          </button>
          <button
            onClick={() => setActiveTab('Debt Reduction')}
            className={
              activeTab === 'Debt Reduction' ? `${styles.active} ` : ''
            }
          >
            Debt Reduction
          </button>
          <button
            onClick={() => setActiveTab('Spending')}
            className={activeTab === 'Spending' ? `${styles.active} ` : ''}
          >
            Spending
          </button>
        </div>
        <div className={styles.popupContent}>
          <GoalForm activeTab={activeTab} />
          <button className={styles.cancelButton} onClick={props.togglePopup}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface GoalFormProps {
  activeTab: string;
}

const GoalForm: React.FC<GoalFormProps> = ({ activeTab }) => {
  return (
    <div className={styles.goalForm}>
      {activeTab === 'Savings' && (
        <form>
          <p>Set your savings goals below:</p>
          <div className={styles.formGroup}>
            <label>Name:</label>
            <input type="text" />
          </div>
          <div className={styles.formGroup}>
            <label>Current Amount:</label>
            <input type="number" />
          </div>
          <div className={styles.formGroup}>
            <label>Target Amount:</label>
            <input type="number" />
          </div>
          <div className={styles.formGroup}>
            <label>Target Date:</label>
            <input type="date" />
          </div>
          <button type="submit">Save</button>
        </form>
      )}
      {activeTab === 'Debt Reduction' && (
        <form>
          <p>Set your debt reduction goals below:</p>
          <div className={styles.formGroup}>
            <label>Name:</label>
            <input type="text" />
          </div>
          <div className={styles.formGroup}>
            <label>Current Amount:</label>
            <input type="number" />
          </div>
          <div className={styles.formGroup}>
            <label>Target Amount:</label>
            <input type="number" />
          </div>
          <div className={styles.formGroup}>
            <label>Target Date:</label>
            <input type="date" />
          </div>
          <button type="submit">Save</button>
        </form>
      )}
      {activeTab === 'Spending' && (
        <form>
          <p>Set your spending goals below:</p>
          <div className={styles.formGroup}>
            <label>Name:</label>
            <input type="text" />
          </div>
          <div className={styles.formGroup}>
            <label>Max Spending Goal:</label>
            <input type="number" />
          </div>
          <div className={styles.formGroup}>
            <label>Target Date:</label>
            <input type="date" />
          </div>
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
};

export default AddGoalPopup;
