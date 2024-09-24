import React, { useState, useContext } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import styles from './EditGoalPopup.module.css';
import '../../root.css';

/* eslint-disable-next-line */

interface ClearableInputProps {
  value: number;
  onChange: (value: number) => void;
}

const ClearableInput: React.FC<ClearableInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState<number | string>(value);

  const handleFocus = () => {
    if (inputValue === value) {
      setInputValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? '' : Number(e.target.value);
    setInputValue(newValue);
    onChange(newValue as number);
  };

  return (
    <input
      type="number"
      value={inputValue}
      onFocus={handleFocus}
      onChange={handleChange}
      required
    />
  );
};

export interface EditGoalPopupProps {
  togglePopup: () => void;
  toggleMainPopup: () => void;
  goal: any;
}

export function EditGoalPopup(props: EditGoalPopupProps) {
  const p = props.goal.type;
  return (
    <div className={styles.addGoalPopup}>
      <div className={styles.popupContainer}>
        <div className={styles.popupContent}>
          <GoalForm
            togglePopup={props.togglePopup}
            goal={props.goal}
            toggleMainPopup={props.toggleMainPopup}
          />
          <button className={styles.cancelButton} onClick={props.togglePopup}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface GoalFormProps {
  togglePopup: () => void;
  toggleMainPopup: () => void;
  goal: any;
}

const GoalForm: React.FC<GoalFormProps> = (props: GoalFormProps) => {
  const [goalName, setGoalName] = useState(props.goal.name);
  const [currentAmount, setCurrentAmount] = useState(props.goal.current_amount);
  const [targetAmount, setTargetAmount] = useState(props.goal.target_amount);
  const [targetDate, setTargetDate] = useState(props.goal.target_date);
  const [spendingLimit, setSpendingLimit] = useState(props.goal.spending_limit);
  const user = useContext(UserContext);

  const handleSubmit = async (e: React.FormEvent) => {
    props.goal.name = goalName;
    if (props.goal.type === 'Savings') {
      props.goal.current_amount = currentAmount;
      props.goal.target_amount = targetAmount;
      props.goal.target_date = targetDate;
    }
    else if (props.goal.type === 'Debt Reduction') {
      props.goal.current_amount = currentAmount;
      props.goal.target_date = targetDate;
    } 
    else if (props.goal.type === 'Spending Limit') {
      props.goal.spending_limit = spendingLimit;
    }


    if (user && user.uid) {
      e.preventDefault();

      const goalData: any = {
        type: props.goal.type,
        name: goalName,
        uid: user.uid,
      };

      if (props.goal.type === 'Savings') {
        goalData.current_amount = currentAmount;
        goalData.target_amount = targetAmount;
        goalData.target_date = targetDate;
      }
      else if (props.goal.type === 'Debt Reduction') {
        goalData.current_amount = currentAmount;
        goalData.target_date = targetDate;
      } 
      else if (props.goal.type === 'Spending Limit') {
        goalData.spending_limit = spendingLimit;
      }

      try {
        const goalDocRef = doc(db, 'goals', props.goal.id);
        await updateDoc(goalDocRef, goalData);
        props.togglePopup();
      } catch (error) {
        console.error('Error saving goal:', error);
      }
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this goal?'
    );
    if (confirmDelete) {
      const goalData: any = {
        type: props.goal.type,
        name: goalName,
        uid: 'User has deleted this goal.',
      };

      if (props.goal.type === 'Savings' || props.goal.type === 'Debt Reduction') {
        goalData.current_amount = currentAmount;
        goalData.target_amount = targetAmount;
        goalData.target_date = targetDate;
      } else if (props.goal.type === 'Spending Limit') {
        goalData.spending_limit = spendingLimit;
      }

      try {
        const goalDocRef = doc(db, 'goals', props.goal.id);
        await updateDoc(goalDocRef, goalData);
        props.togglePopup();
        props.toggleMainPopup();
        props.goal = null;
      } catch (error) {
        console.error('Error saving goal:', error);
      }
    }
  };

  return (
    <div className={styles.goalForm}>
      <form onSubmit={handleSubmit}>
        <p className={styles.goalDescription}>
          Edit {props.goal.name} below:
          <button className={styles.deleteButton} onClick={handleDelete}>
            Delete Goal
          </button>
        </p>
        {props.goal.type === 'Savings' && (
          <>
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
                short term goal like a vacation fund or a long term goal like
                your retirement savings.
              </span>
              <label>Goal Name:</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                required
              />
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
              <ClearableInput value={targetAmount} onChange={setTargetAmount} />
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
              <input
                type="date"
                value={targetDate || ''}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {props.goal.type === 'Debt Reduction' && (
          <>
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
                Enter a descriptive name for your debt reduction goal. This
                could be a goal to pay off any money you owe, such as a credit
                card or a loan.
              </span>
              <label>Goal Name:</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                required
              />
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
              <label>Debt Amount:</label>
              <ClearableInput
                value={currentAmount}
                onChange={setCurrentAmount}
              />
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
              <input
                type="date"
                value={targetDate || ''}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {props.goal.type === 'Spending Limit' && (
          <>
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
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                required
              />
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
                Enter the monthly spending limit you want to set for this type
                of expense. Spending below this amount each month will
                contribute to your progress.
              </span>
              <label>Spending Limit per Month:</label>
              <ClearableInput
                value={spendingLimit}
                onChange={setSpendingLimit}
              />
            </div>
          </>
        )}

        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditGoalPopup;
