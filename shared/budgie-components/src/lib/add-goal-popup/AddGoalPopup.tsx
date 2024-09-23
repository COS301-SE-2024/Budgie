import React, { useState, useContext, useEffect } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import styles from './AddGoalPopup.module.css';
import '../../root.css';

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
  const [goalType, setGoalType] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Tracks the current step in the wizard
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [debtAmount, setDebtAmount] = useState(0);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [updateMethod, setUpdateMethod] = useState('');
  const user = useContext(UserContext);

  // Handle step navigation
  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGoalTypeSelection = (type: string) => {
    setGoalType(type);
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

  const handleSubmit = async () => {
    const goalData: any = {
      goalType,
      goalName,
      targetAmount,
      targetDate,
      accounts: selectedAccounts,
      description,
      updateMethod,
      spendingLimit,
      debtAmount,
      uid: user?.uid,
    };
    try {
      await addDoc(collection(db, 'goals'), goalData);
      props.togglePopup();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  return (
    <div className={styles.addGoalPopup}>
      <div className={styles.popupContent}>
        {/* Step 1: Select Goal Type */}
        {step === 1 && (
          <div>
            <p className={styles.goalHeading}>Select a Goal Type:</p>
            <div className={styles.goalInfo}>
              <button
                className={`${styles.goalTypeButton} ${goalType === 'Savings' ? styles.selected : ''}`}
                onClick={() => handleGoalTypeSelection('Savings')}
              >
                <p className={styles.goalTitle}>Savings Goal</p>
                <p className={styles.goalDescription}>Plan and work towards saving a specific amount of money by a set deadline.</p>
              </button>
              <button
                className={`${styles.goalTypeButton} ${goalType === 'Spending Limit' ? styles.selected : ''}`}
                onClick={() => handleGoalTypeSelection('Spending Limit')}
              >
                <p className={styles.goalTitle}>Limit Spending</p>
                <p className={styles.goalDescription}>Control your spending by setting a monthly limit on your purchases.</p>
              </button>
              <button
                className={`${styles.goalTypeButton} ${goalType === 'Debt Reduction' ? styles.selected : ''}`}
                onClick={() => handleGoalTypeSelection('Debt Reduction')}
              >
                <p className={styles.goalTitle}>Debt Reduction</p>
                <p className={styles.goalDescription}>Focus on paying outstanding debts, such as loans or credit cards.</p>
              </button>
            </div>

            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={props.togglePopup}>
                Cancel
              </button>
              {goalType ? (
                <button className={styles.nextButton} onClick={handleNext}>
                  Next
                </button>
              ) : null}
            </div>

          </div>
        )}

        {/* Step 2: Goal Details */}
        {step === 2 && goalType === 'Savings' && (
          <div>
            <p className={styles.goalHeading}>Savings Goal Details</p>
            <div className={styles.goalInfo}>
              <div className={styles.goalForm}>
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
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={props.togglePopup}>
                Cancel
              </button>
              <button className={styles.prevButton} onClick={handleBack}>Previous</button>
              <button className={styles.nextButton} onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && goalType === 'Spending Limit' && (
          <div>
            <p className={styles.goalHeading}>Spending Limit Goal</p>
            <div className={styles.goalInfo}>
              <div className={styles.goalForm}>
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
                    Enter the monthly spending limit you want to set for this type
                    of expense. Spending below this amount each month will
                    contribute to your progress.
                  </span>
                  <label>Monthly Limit:</label>
                  <ClearableInput value={spendingLimit} onChange={setSpendingLimit} />
                </div>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={props.togglePopup}>
                Cancel
              </button>
              <button className={styles.prevButton} onClick={handleBack}>Previous</button>
              <button className={styles.nextButton} onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && goalType === 'Debt Reduction' && (
          <div>

            <p className={styles.goalHeading}>Debt Reduction Goal</p>
            <div className={styles.goalInfo}>
              <div className={styles.goalForm}>
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
                    Enter the amount of money you currently owe on this debt.
                  </span>
                  <label>Debt Amount:</label>
                  <ClearableInput value={debtAmount} onChange={setDebtAmount} />
                </div>
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={props.togglePopup}>
                Cancel
              </button>
              <button className={styles.prevButton} onClick={handleBack}>Previous</button>
              <button className={styles.nextButton} onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Account Selection */}
        {step === 3 && (
          <div>

            <p className={styles.goalHeading}>Select Accounts</p>
            <div className={styles.goalInfo}>
              <label>Assigned Accounts:</label>
              <select
                multiple
                value={selectedAccounts}
                onChange={(e) => setSelectedAccounts(Array.from(e.target.selectedOptions, option => option.value))}
              >
                {accounts.map((account, idx) => (
                  <option key={idx} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={props.togglePopup}>
                Cancel
              </button>
              <button className={styles.prevButton} onClick={handleBack}>Previous</button>
              <button className={styles.nextButton} onClick={handleNext}>Next</button>
            </div>
          </div>
        )}

        {/* Step 4: Update Method */}
        {step === 4 && goalType === 'Savings' && (
          <div>

            <p className={styles.goalHeading}>How would you like to update this goal?</p>
            <div className={styles.goalInfo}>
              <label>
                <input
                  type="radio"
                  value="assign-all"
                  checked={updateMethod === 'assign-all'}
                  onChange={() => setUpdateMethod('assign-all')}
                />
                Assign all transactions from selected accounts
              </label>
              <label>
                <input
                  type="radio"
                  value="assign-description"
                  checked={updateMethod === 'assign-description'}
                  onChange={() => setUpdateMethod('assign-description')}
                />
                Automatically assign transactions with a certain description
              </label>
              {updateMethod === 'assign-description' && (
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
              )}
              <label>
                <input
                  type="radio"
                  value="manual"
                  checked={updateMethod === 'manual'}
                  onChange={() => setUpdateMethod('manual')}
                />
                Manually assign transactions
              </label>
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={props.togglePopup}>
                Cancel
              </button>
              <button className={styles.prevButton} onClick={handleBack}>Previous</button>
              <button className={styles.nextButton} onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        )}

        {step === 4 && goalType === 'Spending Limit' && (
          <div>

            <p className={styles.goalHeading}>How would you like to update this goal?</p>
            <div className={styles.goalInfo}>
              <label>
                <input
                  type="radio"
                  value="assign-category"
                  checked={updateMethod === 'assign-category'}
                  onChange={() => setUpdateMethod('assign-category')}
                />
                Automatically assign transactions by category
              </label>
              {updateMethod === 'assign-category' && (
                <div>
                  <label>Select Categories:</label>
                  <select multiple>
                    {/* Assume categories is populated */}
                    <option>Groceries</option>
                    <option>Entertainment</option>
                    {/* Add other categories */}
                  </select>
                </div>
              )}
              <label>
                <input
                  type="radio"
                  value="manual"
                  checked={updateMethod === 'manual'}
                  onChange={() => setUpdateMethod('manual')}
                />
                Manually assign transactions
              </label>
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={props.togglePopup}>
                Cancel
              </button>
              <button className={styles.prevButton} onClick={handleBack}>Previous</button>
              <button onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        )}

        {step === 4 && goalType === 'Debt Reduction' && (
          <div>

            <p className={styles.goalHeading}>How would you like to update this goal?</p>
            <div className={styles.goalInfo}>
              <label>
                <input
                  type="radio"
                  value="assign-description"
                  checked={updateMethod === 'assign-description'}
                  onChange={() => setUpdateMethod('assign-description')}
                />
                Automatically assign transactions with a certain description
              </label>
              {updateMethod === 'assign-description' && (
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
              )}
              <label>
                <input
                  type="radio"
                  value="manual"
                  checked={updateMethod === 'manual'}
                  onChange={() => setUpdateMethod('manual')}
                />
                Manually assign transactions
              </label>
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={props.togglePopup}>
                Cancel
              </button>
              <button className={styles.prevButton} onClick={handleBack}>Previous</button>
              <button onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        )}
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
