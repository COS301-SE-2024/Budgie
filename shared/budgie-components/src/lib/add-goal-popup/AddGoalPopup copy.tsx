import React, { useState, useContext, useEffect } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import styles from './AddGoalPopup.module.css';
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
          <GoalForm activeTab={activeTab} togglePopup={props.togglePopup} />
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
}

const GoalForm: React.FC<GoalFormProps> = (props: GoalFormProps) => {
  const [goalName, setGoalName] = useState('');
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(0);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const user = useContext(UserContext);
  const [data, setData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    if (user && user.uid) {
      e.preventDefault();

      const goalData: any = {
        type: props.activeTab,
        name: goalName,
        start_date: startDate,
        uid: user.uid,
      };

      if (props.activeTab === 'Savings' || props.activeTab === 'Debt') {
        goalData.current_amount = currentAmount;
        goalData.target_amount = targetAmount;
        goalData.target_date = targetDate;
        if (props.activeTab === 'Debt') {
          goalData.initial_amount = currentAmount;
        }
      } else if (props.activeTab === 'Spending') {
        goalData.spending_limit = spendingLimit;
      }

      try {
        await addDoc(collection(db, 'goals'), goalData);
        props.togglePopup();
      } catch (error) {
        console.error('Error saving goal:', error);
      }
    }
  };

  function getPopupWidth(): string {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const width =
      20 -
      (35 *
        parseFloat(computedStyle.getPropertyValue('--font-size-multiplier')) -
        35) *
      0.5;
    const widthString = width.toString();
    console.log(computedStyle.getPropertyValue('--font-size-multiplier'));
    return widthString + 'vw';
  }

  const popupWidth = getPopupWidth();

  const [accountOptions, setAccountOptions] = useState<
    { alias: string; accountNumber: string }[]
  >([]);
  const [selectedAlias, setSelectedAlias] = useState<string>('');
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user && user.uid) {
        try {
          const q = query(
            collection(db, 'accounts'),
            where('uid', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          const accountOptionsList = querySnapshot.docs.map((doc) => ({
            alias: doc.data().alias,
            accountNumber: doc.data().account_number,
          }));
          setAccountOptions(accountOptionsList);
          setSelectedAlias(accountOptionsList[0].alias);
          setCurrentAccountNumber(accountOptionsList[0].accountNumber);

        } catch (error) {
          console.error('Error fetching aliases: ', error);
          setError('Failed to fetch accounts. Please try again later.');
        }
      }
    };

    fetchAccounts();
  }, [user]);

  const handleAccountDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = event.target.value;
    const selectedOption = accountOptions.find(
      (option) => option.alias === selected
    );
    if (selectedOption) {
      setSelectedAlias(selected);
      setCurrentAccountNumber(selectedOption.accountNumber);
      setData(null);
      setShowNoData(false);
    }
  };

  return (
    <div className={styles.goalForm}>
      <form onSubmit={handleSubmit}>
        {props.activeTab === 'Savings' && (
          <>
            <p className={styles.goalDescription}>
              Set your savings goal below:
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
                If you have already saved money towards this goal, add that
                amount here. If you haven't, you should leave it as 0.
              </span>
              <label>Associated Account:</label>
              <select
                className={styles.accountDropdown}
                value={selectedAlias}
                onChange={handleAccountDropdownChange}
              >
                {accountOptions.map((option, index) => (
                  <option key={index} value={option.alias}>
                    {option.alias}
                  </option>
                ))}
              </select>
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Select the date you started working towards this goal.
              </span>
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate || ''}
                onChange={(e) => setStartDate(e.target.value)}
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
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

        {props.activeTab === 'Debt' && (
          <>
            <p className={styles.goalDescription}>
              Set your debt reduction goal below:
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Enter the amount of money you currently owe.
              </span>
              <label>Current Debt Amount:</label>
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Enter the amount of money you aim to owe. This should be less
                than the current amount you owe and can even be zero.
              </span>
              <label>Target Debt Amount:</label>
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Select the date you started working towards this goal.
              </span>
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
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

        {props.activeTab === 'Spending' && (
          <>
            <p className={styles.goalDescription}>
              Set your spending goal below:
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Select the date you started working towards this goal.
              </span>
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
              <span className={styles.popupText} style={{ width: popupWidth }}>
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

export default AddGoalPopup;
