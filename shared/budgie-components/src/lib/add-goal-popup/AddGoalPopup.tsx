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

type Condition = {
  accounts: string[];
  keywords: string[];
  category: string;
};


export interface AddGoalPopupProps {
  togglePopup: () => void;
}

export function AddGoalPopup(props: AddGoalPopupProps) {
  const [goalType, setGoalType] = useState<string | null>(null);
  const [step, setStep] = useState(1);
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
  const [accountOptions, setAccountOptions] = useState<
    { alias: string; accountNumber: string }[]
  >([]);
  const [selectedAlias, setSelectedAlias] = useState<string>('');
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const [conditions, setConditions] = useState<Condition[]>([]);

  const addCondition = () => {

    if (selectedAccounts.length == 0 && keywords.length == 0 && selectedCategory == "Any") {
      alert("Please set at least one condition.")
    }
    else if (selectedAccounts.length == 0) {
      alert("Please select at least one account.")
    }
    else {
      const newCondition: Condition = {
        accounts: selectedAccounts,
        keywords: keywords,
        category: selectedCategory,
      };

      setConditions([...conditions, newCondition]);

      setSelectedAccounts([]);
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

  async function checkGoalExists(name: string) {
    try {
      const q = query(
        collection(db, 'goals'),
        where('name', '==', name),
        where('uid', '==', user?.uid)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking document existence: ', error);
      return false;
    }
  }

  const handleNext = async () => {
    if (step === 2) {
      const goalNameExists = checkGoalExists(goalName);
      if (await goalNameExists) {
        alert('You already have a goal with this name.');
        return;
      }
      else if (goalType === 'Savings') {
        if (!goalName) {
          alert("Please enter a goal name.");
          return;
        }
        if (!targetAmount || targetAmount <= 0) {
          alert("Please enter a valid target savings amount.");
          return;
        }
        if (!targetDate) {
          alert("Please select a target date.");
          return;
        }
      } else if (goalType === 'Spending Limit') {
        if (!goalName) {
          alert("Please enter a goal name.");
          return;
        }
        if (!spendingLimit || spendingLimit <= 0) {
          alert("Please enter a valid monthly spending limit.");
          return;
        }
      } else if (goalType === 'Debt Reduction') {
        if (!goalName) {
          alert("Please enter a goal name.");
          return;
        }
        if (!debtAmount || debtAmount <= 0) {
          alert("Please enter a valid debt amount.");
          return;
        }
        if (!targetDate) {
          alert("Please select a target date.");
          return;
        }
      }
    } else if (step === 3) {
      if (!updateMethod) {
        alert("Please select an update method for the goal.");
        return;
      }
    }

    if (step < 5) setStep(step + 1);
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
        return styles.default;
    }
  };

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
  }, []);

  const popupWidth = getPopupWidth();

  const handleSubmit = async () => {
    const goalData: any = {
      type: goalType,
      name: goalName,
      uid: user?.uid,
      update_type: updateMethod,
    };
    if (updateMethod == 'automatic' && conditions.length == 0) {
      alert("Please enter atleast one condition.")

    }
    else {
      if (updateMethod == 'automatic' && conditions.length > 0) {
        const goalConditions = JSON.stringify(conditions);
        goalData.conditions = goalConditions;
      }
      if (goalType === 'Savings' || goalType === 'Debt Reduction') {
        goalData.target_date = targetDate
        if (goalType === 'Debt Reduction') {
          goalData.initial_amount = debtAmount;
          goalData.current_amount = debtAmount;
        }
        if (goalType === 'Savings') {
          goalData.current_amount = 0;
          goalData.target_amount = targetAmount;
        }
      } else if (goalType === 'Spending Limit') {
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


  return (
    <div className="fixed top-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50000 w-[85vw] text-sm md:text-lg lg:text-xl">
      {/*1: Select Goal Type */}
      {step === 1 && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">

          <p className={styles.goalHeading}>Select a Goal Types:</p>
          <div className={styles.goalInfo}>
            <button
              className={`${styles.goalTypeButton} ${goalType === 'Savings' ? styles.selected : ''}`}
              onClick={() => handleGoalTypeSelection('Savings')}
            >
              <p className={styles.goalTitle}>Savings Goal</p>
              <p className={styles.goalDescriptions}>Plan and work towards saving a specific amount of money by a set deadline.</p>
            </button>
            <button
              className={`${styles.goalTypeButton} ${goalType === 'Spending Limit' ? styles.selected : ''}`}
              onClick={() => handleGoalTypeSelection('Spending Limit')}
            >
              <p className={styles.goalTitle}>Limit Spending</p>
              <p className={styles.goalDescriptions}>Control your spending by setting a monthly limit on your purchases.</p>
            </button>
            <button
              className={`${styles.goalTypeButton} ${goalType === 'Debt Reduction' ? styles.selected : ''}`}
              onClick={() => handleGoalTypeSelection('Debt Reduction')}
            >
              <p className={styles.goalTitle}>Debt Reduction</p>
              <p className={styles.goalDescriptions}>Focus on paying outstanding debts, such as loans or credit cards.</p>
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

      {/*2: Goal Details */}
      {step === 2 && goalType === 'Savings' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">

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
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">

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
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
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

      {/*3: Update Method */}
      {step === 3 && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>How would you like to update this goal?</p>
          <div className={styles.updateGoalInfo}>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <input
                type="radio"
                value="manual"
                checked={updateMethod === 'manual'}
                onChange={() => setUpdateMethod('manual')}
                style={{ marginRight: '1rem' }}
              />
              Manual Updates Only
            </label>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <input
                type="radio"
                value="automatic"
                checked={updateMethod === 'automatic'}
                style={{ marginRight: '1rem' }}
                onChange={() => setUpdateMethod('automatic')}
              />
              Include Automatic Updates
            </label>
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


      {/*4: Manual Updates */}
      {step === 4 && updateMethod == 'manual' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>Manually Updated Goal</p>
          <div className={styles.goalInfo}>
            <p className={styles.goalDescription} style={{ textAlign: 'center' }}>You are about to create a manually updated goal.</p>
            <p className={styles.goalDescription} style={{ textAlign: 'center', marginTop: '1rem' }}>You will be able to update this goal by manually adding or removing funds or linking transactions.</p>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={props.togglePopup}>Cancel</button>
            <button className={styles.prevButton} onClick={handleBack}>Previous</button>
            <button className={styles.nextButton} onClick={handleSubmit}>Confirm</button>
          </div>
        </div>
      )}

      {/*4: Set Conditions */}
      {step === 4 && updateMethod == 'automatic' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>Set Automatic Update Conditions</p>
          <div className="flex flex-col items-center w-full max-h-[40vh]">
            <p className={styles.goalDescription} style={{ textAlign: 'center' }}>
              Set the conditions for the transactions you want to be associated with this goal. Transactions meeting any of the conditions you set will be associated with the goal.
            </p>
            <button onClick={handleNext} style={{ padding: '0.5rem 1rem', color: "var(--primary-1)", fontWeight: 'bold', marginBottom: '2vh' }}>Add Condition</button>

            {/* Scrollable Section for Added Conditions */}
            {conditions.length > 0 && (
              <div className="flex-grow border overflow-y-auto p-4" style={{ backgroundColor: 'var(--main-background)', width: '100%' }}>
                {conditions.map((condition, index) => (
                  <div key={index} className="flex justify-between bg-gray-100 px-3 py-1 mb-2 rounded">
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ color: 'var(--primary-1)', fontWeight: 'bold' }}>Condition {index + 1}</p>
                      {condition.accounts.length > 0 && (<p>Accounts: {condition.accounts.join(', ')}</p>)}
                      {condition.keywords.length > 0 && (<p>Keywords: {condition.keywords.join(', ')}</p>)}
                      {condition.category && condition.category != "Any" && (<p>Category: {condition.category}</p>)}
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
                {conditions.length === 0 && <p className="text-center text-gray-500">No conditions added.</p>}
              </div>
            )}
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={props.togglePopup}>Cancel</button>
            <button className={styles.prevButton} onClick={handleBack}>Previous</button>
            {conditions.length > 0 && (
              <button className={styles.nextButton} onClick={handleSubmit}>Confirm</button>
            )}
          </div>
        </div>

      )}

      {step === 5 && updateMethod == 'automatic' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading} style={{ marginBottom: '0' }}>Add Condition</p>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[75%] w-full px-4 py-2 space-y-4" style={{ backgroundColor: 'var(--main-background)', border: '2px solid var(--primary-1)' }}>

            {/* Select Accounts Section */}
            <div className="border border-gray-300 p-4 rounded-lg" style={{ backgroundColor: 'var(--block-background)' }}>
              <p className={styles.goalDescription} style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>
                Select the account/s from which you want transactions to be selected.
              </p>
              <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {accountOptions.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        value={option.alias}
                        checked={selectedAccounts.includes(option.alias)}
                        onChange={(e) => {
                          const selected = e.target.value;
                          if (e.target.checked) {
                            setSelectedAccounts((prevAccounts) =>
                              prevAccounts.filter((account) => account !== 'no-account').concat(selected)
                            );
                          } else {
                            setSelectedAccounts((prevAccounts) =>
                              prevAccounts.filter((account) => account !== selected)
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

            {/* Select Transaction Descriptions Section */}
            <div className="border border-gray-300 p-4 rounded-lg" style={{ backgroundColor: 'var(--block-background)' }}>
              <p className={styles.goalDescription} style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>
                Enter the description keyword/s for the transactions you want to be selected.
              </p>
              <div className="flex flex-col items-center">
                <div className="flex items-center mt-4">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter keyword"
                    className="border border-gray-300 rounded px-2 py-1 mr-2 w-full max-w-xs"
                  />
                  <button onClick={addKeyword} style={{ padding: '0.5rem 1rem', color: "var(--primary-1)", fontWeight: 'bold' }}>Add</button>
                </div>
                <div className="mt-4" style={{ textAlign: 'left', fontSize: 'calc(1rem * var(--font-size-multiplier))' }}>
                  {keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center bg-gray-200 px-3 py-1 rounded-sm mr-2 mb-2"
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

            {/* Select Spending Category Section */}
            <div className="border border-gray-300 p-4 rounded-lg" style={{ backgroundColor: 'var(--block-background)' }}>
              <p className={styles.goalDescription} style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>
                Select the transaction category that you want to be selected.
              </p>
              <div className="mt-4">
                <select
                  className={`border border-gray-300 rounded px-3 py-2 w-full ${styles.categoryDropdown} ${getCategoryStyle(selectedCategory)}`}
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

          {/* Button Container */}

          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={props.togglePopup}>
              Cancel
            </button>
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
