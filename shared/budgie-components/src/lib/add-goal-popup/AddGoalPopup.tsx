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
            onClick={() => setActiveTab('Debt')}
            className={activeTab === 'Debt' ? `${styles.active} ` : ''}
          >
            Debt
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
          <p className={styles.goalDescription}>
            Set your savings goals below. You can update your progress monthly.
          </p>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              Enter a descriptive name for your savings goal. This could be a
              short term goal like a vacation fund or a long term goal like your
              retirement savings.
            </span>
            <label>Goal Name:</label>
            <input type="text" />
          </div>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              If you have already saved money towards this goal, add that amount
              here. If you haven't, you should enter 0.
            </span>
            <label>Current Savings Amount:</label>
            <input type="number" />
          </div>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              Enter the amount of money you aim to save for this goal.
            </span>
            <label>Target Savings Amount:</label>
            <input type="number" />
          </div>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              Select the date by which you want to reach this goal.
            </span>
            <label>Target Date:</label>
            <input type="date" />
          </div>
          <button type="submit">Save</button>
        </form>
      )}
      {activeTab === 'Debt' && (
        <form>
          <p className={styles.goalDescription}>
            Set your debt reduction goals below. You can update your progress
            monthly.
          </p>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              Enter a descriptive name for your debt reduction goal. This could
              be a goal to pay off any money you owe, such as a credit card or a
              loan.
            </span>
            <label>Goal Name:</label>
            <input type="text" />
          </div>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              Enter the amount of money you currently owe.
            </span>
            <label>Current Debt Amount:</label>
            <input type="number" />
          </div>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              Enter the amount of money you aim to owe. This should be less than
              the current amount you owe and can even be zero.
            </span>
            <label>Target Debt Amount:</label>
            <input type="number" />
          </div>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              Select the date by which you want to reach this goal.
            </span>
            <label>Target Date:</label>
            <input type="date" />
          </div>
          <button type="submit">Save</button>
        </form>
      )}
      {activeTab === 'Spending' && (
        <form>
          <p className={styles.goalDescription}>
            Set your spending goals below. You can update your progress monthly.
          </p>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              Enter a descriptive name for your spending reduction goal. This
              could be a specific type of spending you want to reduce such as
              entertainment or dining out.
            </span>
            <label>Goal Name:</label>
            <input type="text" />
          </div>
          <div className={styles.formGroup}>
            <span
              className={`material-symbols-outlined ${styles.icon}`}
              style={{
                fontSize: 'calc(1rem * var(--font-size-multiplier))',
                color: 'var(--greyed-text)',
              }}
            >
              info
            </span>
            <span className={styles.popupText}>
              Enter the monthly spending limit you want to set for this type of
              expense. Spending below this amount each month will contribute to
              your progress.
            </span>
            <label>Spending Limit per Month:</label>
            <input type="number" />
          </div>
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
};

export default AddGoalPopup;
