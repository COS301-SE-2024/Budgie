import React, { useState, useContext, useEffect } from 'react';
import { addDoc, collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import styles from './UpdateGoalProgressPopup.module.css';
import '../../root.css';
import { type } from 'os';

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

export interface UpdateGoalProgressPopupProps {
  togglePopup: () => void;
  goal: any;
}

export function UpdateGoalProgressPopup(props: UpdateGoalProgressPopupProps) {
  const p = props.goal.type;
  return (
    <div className={styles.addGoalPopup}>
      <div className={styles.popupContainer}>
        <div className={styles.popupContent}>
          <GoalForm
            activeTab={p}
            togglePopup={props.togglePopup}
            goal={props.goal}
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
  activeTab: string;
  togglePopup: () => void;
  goal: any;
}

const GoalForm: React.FC<GoalFormProps> = (props: GoalFormProps) => {
  const [goalName, setGoalName] = useState(props.goal.name);
  const [goalID, setID] = useState(props.goal.id);
  const [currentAmount, setCurrentAmount] = useState(props.goal.current_amount);
  const [targetAmount, setTargetAmount] = useState(props.goal.target_amount);
  const [startDate, setStartDate] = useState(props.goal.start_date);
  const [spendingLimit, setSpendingLimit] = useState(props.goal.spending_limit);
  const [spentAmount, setSpentAmount] = useState(0);
  const [updateAmount, setUpdateAmount] = useState(0);
  const [updateDate, setupdateDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const user = useContext(UserContext);

  interface Goal {
    id: string;
    name: string;
    type: string;
    start_date: string;
    initial_amount?: number;
    current_amount?: number;
    target_amount?: number;
    target_date?: string;
    spending_limit?: number;
    updates?: string;
  }

  interface SpentAmount {
    amount: number;
    date: string;
  }

  const calculateProgressPercentage = (goal: Goal): string => {
    if (goal.current_amount !== undefined && goal.target_amount !== undefined) {
      if (goal.initial_amount !== undefined) {
        return Math.min(
          100,
          ((goal.initial_amount - goal.current_amount) /
            (goal.initial_amount - goal.target_amount)) *
            100
        ).toFixed(2);
      } else {
        return Math.min(
          100,
          (goal.current_amount / goal.target_amount) * 100
        ).toFixed(2);
      }
    }
    return '0.00';
  };

  const calculateNewCurrentAmount = (goal: Goal): string => {
    if (
      updateAmount &&
      goal.current_amount !== undefined &&
      goal.target_amount !== undefined
    ) {
      if (goal.initial_amount !== undefined) {
        return Math.min(goal.current_amount - updateAmount).toFixed(2);
      }
      return (currentAmount + updateAmount).toFixed(2);
    } else {
      return currentAmount.toFixed(2);
    }
  };

  const calculateNewProgress = (goal: Goal): string => {
    if (goal.current_amount !== undefined && goal.target_amount !== undefined) {
      if (goal.initial_amount !== undefined) {
        return Math.min(
          100,
          ((goal.initial_amount - goal.current_amount + updateAmount) /
            (goal.initial_amount - goal.target_amount)) *
            100
        ).toFixed(2);
      } else {
        return Math.min(
          100,
          ((goal.current_amount + updateAmount) / goal.target_amount) * 100
        ).toFixed(2);
      }
    }
    return '0.00';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const goalData: any = {
      type: props.activeTab,
      name: goalName,
      start_date: startDate,
      uid: user.uid,
    };

    if (props.activeTab === 'Savings' || props.activeTab === 'Debt') {
      goalData.current_amount =
        props.activeTab === 'Debt'
          ? currentAmount - updateAmount
          : currentAmount + updateAmount;
      goalData.target_amount = targetAmount;
      goalData.target_date = props.goal.target_date;
    } else if (props.activeTab === 'Spending') {
      goalData.spending_limit = spendingLimit;
    }

    try {
      const goalDocRef = doc(db, 'goals', props.goal.id);
      const goalDoc = await getDoc(goalDocRef);
      const existingUpdates = goalDoc.exists()
        ? goalDoc.data()?.updates || '[]'
        : '[]';
      const updatesArray = JSON.parse(existingUpdates);

      const existingSpending = goalDoc.exists()
        ? goalDoc.data()?.spending || '[]'
        : '[]';
      const spendingArray = JSON.parse(existingSpending);

      const newUpdate = {
        amount: updateAmount,
        date: updateDate,
      };
      updatesArray.push(newUpdate);

      if (props.activeTab === 'Spending') {
        const newSpendingUpdate = {
          amount: updateAmount,
          date: getMonthName(updateDate) + ' ' + getYear(updateDate),
        };

        const goalDocRef = doc(db, 'goals', props.goal.id);
        const goalDoc = await getDoc(goalDocRef);
        const existingData = goalDoc.data();
        const spendingArray = existingData?.spending
          ? JSON.parse(existingData.spending)
          : [];

        const existingEntryIndex = spendingArray.findIndex(
          (entry: { date: string }) => entry.date === newSpendingUpdate.date
        );

        if (existingEntryIndex >= 0) {
          spendingArray[existingEntryIndex].amount += newSpendingUpdate.amount;
        } else {
          spendingArray.push(newSpendingUpdate);
        }

        await updateDoc(goalDocRef, {
          ...goalData,
          spending: JSON.stringify(spendingArray),
        });
        props.togglePopup();
      }

      await updateDoc(goalDocRef, {
        ...goalData,
        updates: JSON.stringify(updatesArray),
      });

      props.togglePopup();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  function getMonthName(dateString: string) {
    const date = new Date(dateString);
    const monthName = new Intl.DateTimeFormat('en-US', {
      month: 'long',
    }).format(date);
    return monthName;
  }

  function getYear(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    return year;
  }

  useEffect(() => {
    function getMonthAmount() {
      const dateToFind = getMonthName(updateDate) + ' ' + getYear(updateDate);
      const spendingArray: SpentAmount[] = props.goal.spending
        ? JSON.parse(props.goal.spending)
        : [];
      const entry = spendingArray.find((entry) => entry.date === dateToFind);

      if (entry) {
        setSpentAmount(entry.amount);
      } else {
        setSpentAmount(0);
      }
    }

    getMonthAmount();
  }, [updateDate]);

  return (
    <div className={styles.goalForm}>
      <form onSubmit={handleSubmit}>
        <p className={styles.goalDescription}>
          Update your progress on {props.goal.name} below:
        </p>
        {props.activeTab === 'Savings' && (
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
                Select the date this goal update was made.
              </span>
              <label>Transaction Date:</label>
              <input
                type="date"
                value={updateDate || ''}
                onChange={(e) => setupdateDate(e.target.value)}
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
                Enter the amount of money you added/withdrew from this goal. If
                you withdrew money, enter a negative number.
              </span>
              <label>Amount to Add/Withdraw:</label>
              <ClearableInput value={updateAmount} onChange={setUpdateAmount} />
            </div>
            <div className={styles.progressInfoContainer}>
              <div className={styles.target}>
                Target Amount:
                <p>R {targetAmount.toFixed(2)}</p>
              </div>
              <div className={styles.progressInfoBox}>
                <div className={styles.progressInfo}>
                  <div>Current Savings Amount:</div>
                  <p>R {currentAmount.toFixed(2)}</p>
                  <div>Current Savings Progress:</div>
                  <p>{calculateProgressPercentage(props.goal)} %</p>
                </div>
                <div className={styles.progressInfo}>
                  <div>New Savings Amount:</div>
                  <p>R {calculateNewCurrentAmount(props.goal)}</p>
                  <div>New Savings Progress:</div>
                  <p>{calculateNewProgress(props.goal)} %</p>
                </div>
              </div>
            </div>
          </>
        )}

        {props.activeTab === 'Debt' && (
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
                Select the date this debt payment was made.
              </span>
              <label>Transaction Date:</label>
              <input
                type="date"
                value={updateDate || ''}
                onChange={(e) => setupdateDate(e.target.value)}
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
                Enter the amount of money you paid towards the debt.
              </span>
              <label>Payment Amount:</label>
              <ClearableInput value={updateAmount} onChange={setUpdateAmount} />
            </div>
            <div className={styles.progressInfoContainer}>
              <div className={styles.target}>
                Target Amount:
                <p>R {targetAmount.toFixed(2)}</p>
              </div>
              <div className={styles.progressInfoBox}>
                <div className={styles.progressInfo}>
                  <div>Current Debt Amount:</div>
                  <p>R {currentAmount.toFixed(2)}</p>
                  <div>Current Goal Progress:</div>
                  <p>{calculateProgressPercentage(props.goal)} %</p>
                </div>
                <div className={styles.progressInfo}>
                  <div>New Debt Amount:</div>
                  <p>R {calculateNewCurrentAmount(props.goal)}</p>
                  <div>New Goal Progress:</div>
                  <p>{calculateNewProgress(props.goal)} %</p>
                </div>
              </div>
            </div>
          </>
        )}

        {props.activeTab === 'Spending' && (
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
                Select the date you spent money in this category.
              </span>
              <label>Transaction Date:</label>
              <input
                type="date"
                value={updateDate || ''}
                onChange={(e) => setupdateDate(e.target.value)}
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
                Enter the amount of money you spent.
              </span>
              <label>Spending Amount:</label>
              <ClearableInput value={updateAmount} onChange={setUpdateAmount} />
            </div>
            <div className={styles.progressInfoContainer}>
              <div className={styles.target}>
                Spending Limit for {getMonthName(updateDate)}{' '}
                {getYear(updateDate)}:<p>R {spendingLimit.toFixed(2)}</p>
              </div>
              <div className={styles.progressInfoBox}>
                <div className={styles.progressInfo}>
                  <div>Current Amount Spent:</div>
                  <p>R {spentAmount}</p>
                  <div>Current Amount Left in Budget:</div>
                  <p>R {spendingLimit- spentAmount}</p>
                </div>
                <div className={styles.progressInfo}>
                  <div>New Amount Spent:</div>
                  <p>R {spentAmount + updateAmount}</p>
                  <div>New Amount Left in Budget:</div>
                  <p>R {spendingLimit- spentAmount - updateAmount}</p>
                </div>
                {/*<div className={styles.progressInfo}>
                  <div>New Debt Amount:</div>
                  <p>R {calculateNewCurrentAmount(props.goal)}</p>
                  <div>New Goal Progress:</div>
                  <p>{calculateNewProgress(props.goal)} %</p>
                </div>*/}
              </div>
            </div>
          </>
        )}

        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default UpdateGoalProgressPopup;
