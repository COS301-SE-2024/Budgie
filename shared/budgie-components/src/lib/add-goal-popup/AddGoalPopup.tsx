import React, { useState, useContext, useEffect } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import styles from './AddGoalPopup.module.css';
import '../../root.css';
import { useDataContext } from '../data-context/DataContext';

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

type Condition = {
  accounts: string[];
  keywords: string[];
  category: string;
};

interface Account {
  name: string;
  alias: string;
  type: string;
  account_number: string;
}

interface Goal {
  id: string;
  name: string;
  type: string;
  initial_amount?: number;
  current_amount: number;
  target_amount?: number;
  target_date?: string;
  spending_limit?: number;
  updates?: string;
  deleted_updates?: string;
  monthly_updates?: string;
  update_type: string;
  last_update?: string;
  conditions?: string;
}

export interface AddGoalPopupProps {
  togglePopup: () => void;
}

export function AddGoalPopup(props: AddGoalPopupProps) {
  const { data, setData, refreshData } = useDataContext();
  const [accountOptions, setAccountOptions] = useState<Account[]>([]);
  const [selectedAliases, setSelectedAliases] = useState<string[]>([]);
  const [goalType, setGoalType] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [debtAmount, setDebtAmount] = useState(0);
  const [description, setDescription] = useState('');
  const user = useContext(UserContext);

  const [selectedAccountNumbers, setSelectedAccountNumbers] = useState<
    string[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);

  useEffect(() => {
    setAccountOptions(data.accounts);
  }, []);

  const addCondition = () => {
    if (
      selectedAccountNumbers.length == 0 &&
      keywords.length == 0 &&
      selectedCategory == 'Any'
    ) {
      alert('Please set at least one condition.');
    } else if (selectedAccountNumbers.length == 0) {
      alert('Please select at least one account.');
    } else {
      const newCondition: Condition = {
        accounts: selectedAccountNumbers,
        keywords: keywords,
        category: selectedCategory,
      };

      setConditions([...conditions, newCondition]);
      setSelectedAccountNumbers([]);
      setKeywords([]);
      setSelectedCategory('Any');
      handleBack();
    }
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addKeyword = () => {
    if (description && !keywords.includes(description)) {
      setKeywords([...keywords, description]);
      setDescription('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((kw) => kw !== keyword));
  };

  const handleNext = async () => {
    if (step === 2) {
      if (!goalName) {
        alert('Please enter a goal name.');
        return;
      }

      if (data.goals.some((goal) => goal.name === goalName)) {
        alert('You already have a goal with this name.');
        return;
      } else if (goalType === 'Savings') {
        if (!targetAmount || targetAmount <= 0) {
          alert('Please enter a valid target savings amount.');
          return;
        }
        if (!targetDate) {
          alert('Please select a target date.');
          return;
        }
      } else if (goalType === 'Spending Limit') {
        if (!spendingLimit || spendingLimit <= 0) {
          alert('Please enter a valid monthly spending limit.');
          return;
        }
      } else if (goalType === 'Debt Reduction') {
        if (!debtAmount || debtAmount <= 0) {
          alert('Please enter a valid debt amount.');
          return;
        }
        if (!targetDate) {
          alert('Please select a target date.');
          return;
        }
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    if (step == 2) {
      setSelectedAliases([]);
      setGoalType(null);
      setStep(1);
      setGoalName('');
      setTargetAmount(0);
      setTargetDate(null);
      setSpendingLimit(0);
      setDebtAmount(0);
      setSelectedAccountNumbers([]);
      setDescription('');
    }
    if (step == 4) {
      setSelectedAliases([]);
      setSelectedAccountNumbers([]);
      setDescription('');
      setSelectedCategory('');
      setKeywords([]);
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Income':
        return styles.income;
      case 'Transport':
        return styles.transport;
      case 'Eating Out':
        return styles.eatingOut;
      case 'Groceries':
        return styles.groceries;
      case 'Entertainment':
        return styles.entertainment;
      case 'Shopping':
        return styles.shopping;
      case 'Insurance':
        return styles.insurance;
      case 'Utilities':
        return styles.utilities;
      case 'Medical Aid':
        return styles.medicalAid;
      case 'Other':
        return styles.other;
      case 'Transfer':
        return styles.transfer;
      default:
        return styles.other;
    }
  };

  const handleSubmit = async () => {
    const goalData: any = {
      type: goalType,
      name: goalName,
      uid: user?.uid,
    };

    if (conditions.length > 0) {
      goalData.update_type = 'automatic';
      goalData.conditions = JSON.stringify(conditions);
    } else {
      goalData.update_type = 'manual';
    }

    if (goalType === 'Debt Reduction') {
      goalData.target_date = targetDate;
      goalData.initial_amount = debtAmount;
      goalData.current_amount = debtAmount;
    }
    if (goalType === 'Savings') {
      goalData.target_date = targetDate;
      goalData.current_amount = 0;
      goalData.target_amount = targetAmount;
    }
    if (goalType === 'Spending Limit') {
      goalData.spending_limit = spendingLimit;
    }

    try {
      const goalRef = await addDoc(collection(db, 'goals'), goalData);

      const newGoal = { ...goalData, id: goalRef.id };

      const updatedUserData = {
        ...data,
        goals: [...data.goals, newGoal],
      };

      setData(updatedUserData);

      handleCancel();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleCancel = () => {
    props.togglePopup();
    setSelectedAliases([]);
    setGoalType(null);
    setStep(1);
    setGoalName('');
    setTargetAmount(0);
    setTargetDate(null);
    setSpendingLimit(0);
    setDebtAmount(0);
    setSelectedAccountNumbers([]);
    setDescription('');
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
    return widthString + 'vw';
  }

  const popupWidth = getPopupWidth();

  return (
    <div className="fixed top-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50000 text-sm md:text-lg lg:text-xl w-full">
      {/*1: Select Goal Type */}
      {step === 1 && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>Select a Goal Types:</p>
          <div className={styles.goalInfo}>
            <button
              className={`${styles.goalTypeButton} ${
                goalType === 'Savings' ? styles.selected : ''
              }`}
              onClick={() => setGoalType('Savings')}
            >
              <p className={styles.goalTitle}>Savings Goal</p>
              <p className={styles.goalDescriptions}>
                Plan and work towards saving a specific amount of money by a set
                deadline.
              </p>
            </button>
            <button
              className={`${styles.goalTypeButton} ${
                goalType === 'Spending Limit' ? styles.selected : ''
              }`}
              onClick={() => setGoalType('Spending Limit')}
            >
              <p className={styles.goalTitle}>Limit Spending</p>
              <p className={styles.goalDescriptions}>
                Control your spending by setting a monthly limit on your
                purchases.
              </p>
            </button>
            <button
              className={`${styles.goalTypeButton} ${
                goalType === 'Debt Reduction' ? styles.selected : ''
              }`}
              onClick={() => setGoalType('Debt Reduction')}
            >
              <p className={styles.goalTitle}>Debt Reduction</p>
              <p className={styles.goalDescriptions}>
                Focus on paying outstanding debts, such as loans or credit
                cards.
              </p>
            </button>
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={handleCancel}>
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

      {/*2: Goal Details */}
      {step === 2 && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>
            {goalType === 'Savings'
              ? 'Savings Goal Details'
              : goalType === 'Spending Limit'
              ? 'Spending Limit Goal Details'
              : 'Debt Reduction Goal Details'}
          </p>
          <div className={styles.goalInfo}>
            <div className={styles.goalForm}>
              {/*Goal Name */}
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
                <span
                  className={styles.popupText}
                  style={{ width: popupWidth }}
                >
                  Enter a descriptive name for your goal.
                </span>
                <label>Goal Name:</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                />
              </div>

              {/*Savings Target Amount*/}
              {goalType === 'Savings' && (
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
                  <span
                    className={styles.popupText}
                    style={{ width: popupWidth }}
                  >
                    Enter the amount of money you aim to save for this goal.
                  </span>
                  <label>Target Savings Amount:</label>
                  <ClearableInput
                    value={targetAmount}
                    onChange={setTargetAmount}
                  />
                </div>
              )}

              {/*Spending Limit*/}
              {goalType === 'Spending Limit' && (
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
                  <span
                    className={styles.popupText}
                    style={{ width: popupWidth }}
                  >
                    Enter the monthly spending limit you want to set for this
                    type of expense. Spending below this amount each month will
                    contribute to your progress.
                  </span>
                  <label>Monthly Limit:</label>
                  <ClearableInput
                    value={spendingLimit}
                    onChange={setSpendingLimit}
                  />
                </div>
              )}

              {/*Debt Amount*/}
              {goalType === 'Debt Reduction' && (
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
                  <span
                    className={styles.popupText}
                    style={{ width: popupWidth }}
                  >
                    Enter the amount of money you currently owe on this debt.
                  </span>
                  <label>Debt Amount:</label>
                  <ClearableInput value={debtAmount} onChange={setDebtAmount} />
                </div>
              )}

              {/*Savings/Debt Target Date*/}
              {(goalType === 'Savings' || goalType === 'Debt Reduction') && (
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
                  <span
                    className={styles.popupText}
                    style={{ width: popupWidth }}
                  >
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
              )}
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
            <button className={styles.prevButton} onClick={handleBack}>
              Previous
            </button>
            <button className={styles.nextButton} onClick={handleNext}>
              Next
            </button>
          </div>
        </div>
      )}

      {/*3: Set Automatic Update Conditions */}
      {step === 3 && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>Set Automatic Update Conditions</p>
          <div className="flex flex-col items-center w-full max-h-[40vh]">
            <p
              className={styles.goalDescription}
              style={{ textAlign: 'center' }}
            >
              If you want this goal to be automatically updated, set the
              conditions for the transactions that should be assigned with this
              goal.
            </p>

            <button
              onClick={handleNext}
              style={{
                padding: '0.5rem 1rem',
                color: 'var(--primary-1)',
                fontWeight: 'bold',
                marginBottom: '2vh',
              }}
            >
              Add Condition
            </button>

            <div
              className="flex-grow border overflow-y-auto p-4"
              style={{
                backgroundColor: 'var(--main-background)',
                width: '100%',
              }}
            >
              {conditions.length == 0 && (
                <p
                  style={{
                    fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  }}
                >
                  No conditions added yet. Clicking "Confirm" will make this a
                  manually updated goal.
                </p>
              )}

              {conditions.map((condition, index) => (
                <div
                  key={index}
                  className="flex justify-between bg-gray-100 px-3 py-1 mb-2 rounded"
                >
                  <div style={{ textAlign: 'left' }}>
                    <p
                      style={{
                        color: 'var(--primary-1)',
                        fontWeight: 'bold',
                      }}
                    >
                      Condition {index + 1}
                    </p>
                    {condition.accounts.length > 0 && (
                      <p>Accounts: {condition.accounts.join(', ')}</p>
                    )}
                    {condition.keywords.length > 0 && (
                      <p>Keywords: {condition.keywords.join(', ')}</p>
                    )}
                    {condition.category && condition.category != 'Any' && (
                      <p>Category: {condition.category}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeCondition(index)}
                    className="text-red-500 font-bold"
                    style={{ marginLeft: '1rem' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
            <button className={styles.prevButton} onClick={handleBack}>
              Previous
            </button>
            <button className={styles.nextButton} onClick={handleSubmit}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading} style={{ marginBottom: '0' }}>
            Add Condition
          </p>
          <div
            className="overflow-y-auto max-h-[75%] w-full px-4 py-2 space-y-4"
            style={{
              backgroundColor: 'var(--main-background)',
              border: '2px solid var(--primary-1)',
            }}
          >
            <div
              className="border border-gray-300 p-4 rounded-lg"
              style={{ backgroundColor: 'var(--block-background)' }}
            >
              <p
                className={styles.goalDescription}
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                }}
              >
                Select the account/s from which you want transactions to be
                selected.
              </p>
              <div
                className="space-y-2"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {accountOptions.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        value={option.alias}
                        checked={selectedAliases.includes(option.alias)}
                        onChange={(e) => {
                          const selectedAlias = e.target.value;
                          const selectedAccount = accountOptions.find(
                            (option) => option.alias === selectedAlias
                          )?.account_number;

                          if (e.target.checked && selectedAccount) {
                            // Add alias and account number
                            setSelectedAliases((prevAliases) => [
                              ...prevAliases,
                              selectedAlias,
                            ]);
                            setSelectedAccountNumbers((prevAccounts) => [
                              ...prevAccounts,
                              selectedAccount,
                            ]);
                          } else {
                            // Remove alias and account number
                            setSelectedAliases((prevAliases) =>
                              prevAliases.filter(
                                (alias) => alias !== selectedAlias
                              )
                            );
                            setSelectedAccountNumbers((prevAccounts) =>
                              prevAccounts.filter(
                                (account) => account !== selectedAccount
                              )
                            );
                          }
                        }}
                        className="mr-3"
                      />
                      {option.alias}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="border border-gray-300 p-4 rounded-lg"
              style={{ backgroundColor: 'var(--block-background)' }}
            >
              <p
                className={styles.goalDescription}
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                }}
              >
                Enter the description keyword/s for the transactions you want to
                be selected.
              </p>
              <div className="flex flex-col items-center">
                <div className="flex items-center mt-4">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter keyword"
                    className="border border-gray-300 rounded px-2 py-1 mr-2 w-full max-w-xs text-black"
                  />
                  <button
                    onClick={addKeyword}
                    style={{
                      padding: '0.5rem 1rem',
                      color: 'var(--primary-1)',
                      fontWeight: 'bold',
                    }}
                  >
                    Add
                  </button>
                </div>
                <div
                  className="mt-4"
                  style={{
                    textAlign: 'left',
                    fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  }}
                >
                  {keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center bg-gray-200 px-3 py-1 rounded-sm mr-2 mb-2 text-black"
                    >
                      <span className="mr-2">{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-red-500 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              className="border border-gray-300 p-4 rounded-lg"
              style={{ backgroundColor: 'var(--block-background)' }}
            >
              <p
                className={styles.goalDescription}
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                }}
              >
                Select the transaction category that you want to be selected.
              </p>
              <div className="mt-4">
                <select
                  className={`border border-gray-300 rounded px-3 py-2 w-full ${
                    styles.categoryDropdown
                  } ${getCategoryStyle(selectedCategory)}`}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Any">Any Category</option>
                  <option value="Income">Income</option>
                  <option value="Transport">Transport</option>
                  <option value="Eating Out">Eating Out</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Medical Aid">Medical Aid</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.prevButton} onClick={handleBack}>
              Back
            </button>
            <button className={styles.nextButton} onClick={addCondition}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddGoalPopup;
