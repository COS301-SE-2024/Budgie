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


  const addKeyword = () => {
    if (description.trim() === '') {
      alert('Please enter a keyword.');
      return;
    }

    setKeywords([...keywords, description.trim()]);
    setDescription('');
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove));
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
    else if (step === 4) {
      if (selectedAccounts.length === 0) {
        alert("Please select at least one account.");
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
      accounts: selectedAccounts,
      uid: user?.uid,
      update_type: updateMethod,
    };
    if (updateMethod == 'assign-description' && keywords.length == 0) {
      alert("Please enter atleast one keyword.")
    }
    else {
      if (updateMethod == 'assign-description' && keywords.length > 0) {
        goalData.description = keywords;
      }
      if (goalType === 'Savings' || goalType === 'Debt Reduction') {
        goalData.target_date= targetDate
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
        goalData.category = selectedCategory;
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
    <div className="fixed top-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-15 w-[85vw] text-sm md:text-lg lg:text-xl">

      {/*1: Select Goal Type */}
      {step === 1 && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">

          <p className={styles.goalHeading}>Select a Goal Type:</p>
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
      {step === 3 && goalType !== 'Spending Limit' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>How would you like to update this goal?</p>
          <div className={styles.updateGoalInfo}>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <input
                type="radio"
                value="assign-all"
                checked={updateMethod === 'assign-all'}
                onChange={() => setUpdateMethod('assign-all')}
                style={{ marginRight: '1rem' }}
              />
              Assign all transactions from selected accounts.
            </label>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <input
                type="radio"
                value="assign-description"
                checked={updateMethod === 'assign-description'}
                style={{ marginRight: '1rem' }}
                onChange={() => setUpdateMethod('assign-description')}
              />
              Automatically assign transactions with a certain description.
            </label>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <input
                type="radio"
                value="assign-transactions"
                checked={updateMethod === 'assign-transactions'}
                onChange={() => setUpdateMethod('assign-transactions')}
                style={{ marginRight: '1rem' }}
              />
              Manually assign transactions.
            </label>
            <label style={{ display: 'block' }}>
              <input
                type="radio"
                value="manual"
                checked={updateMethod === 'manual'}
                onChange={() => setUpdateMethod('manual')}
                style={{ marginRight: '1rem' }}
              />
              Manually input update amounts.
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

      {step === 3 && goalType === 'Spending Limit' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>How would you like to update this goal?</p>
          <div className={styles.updateGoalInfo}>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <input
                type="radio"
                value="assign-category"
                checked={updateMethod === 'assign-category'}
                onChange={() => setUpdateMethod('assign-category')}
                style={{ marginRight: '1rem' }}
              />
              Automatically assign transactions by category.
            </label>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <input
                type="radio"
                value="assign-description"
                checked={updateMethod === 'assign-description'}
                style={{ marginRight: '1rem' }}
                onChange={() => setUpdateMethod('assign-description')}
              />
              Automatically assign transactions with a certain description.
            </label>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <input
                type="radio"
                value="assign-transactions"
                checked={updateMethod === 'assign-transactions'}
                onChange={() => setUpdateMethod('assign-transactions')}
                style={{ marginRight: '1rem' }}
              />
              Manually assign transactions.
            </label>
            <label style={{ display: 'block' }}>
              <input
                type="radio"
                value="manual"
                checked={updateMethod === 'manual'}
                onChange={() => setUpdateMethod('manual')}
                style={{ marginRight: '1rem' }}
              />
              Manually input update amounts.
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

      {/*4: Associated Account Selection */}
      {step === 4 && updateMethod != 'manual' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>Select Accounts</p>
          <div className={styles.goalInfo}>
            <p className={styles.goalDescription} style={{ textAlign: 'center' }}>Select the account/s you want to associate this goal with.</p>
            {updateMethod === 'assign-all' ? (
              <p className={styles.goalDescription} style={{ textAlign: 'center' }}>All transactions for the selected account/s will be automatically assigned to this goal.</p>
            ) : (
              <p className={styles.goalDescription} style={{ textAlign: 'center' }}>Transactions for the selected account/s can be assigned to this goal.</p>
            )}
            <div className={styles.checkBoxContainer}>
              {accountOptions.map((option, index) => (
                <div key={index} className={styles.checkOption}>
                  <label>
                    <input
                      type="checkbox"
                      value={option.alias}
                      checked={selectedAccounts.includes(option.alias)}
                      onChange={(e) => {
                        const selected = e.target.value;
                        if (e.target.checked) {
                          setSelectedAccounts((prevAccounts) =>
                            prevAccounts.filter(account => account !== 'no-account').concat(selected)
                          );
                        } else {
                          setSelectedAccounts((prevAccounts) =>
                            prevAccounts.filter(account => account !== selected)
                          );
                        }
                      }}
                      style={{ marginRight: '1rem' }}
                    />
                    {option.alias}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={props.togglePopup}>Cancel</button>
            <button className={styles.prevButton} onClick={handleBack}>Previous</button>
            {updateMethod === 'assign-all' ? (
              <button className={styles.nextButton} onClick={handleSubmit}>Confirm</button>
            ) : (
              <button className={styles.nextButton} onClick={handleNext}>Next</button>
            )}

          </div>
        </div>
      )}

      {/*4: Manual Updates */}
      {step === 4 && updateMethod == 'manual' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>Manually Updated Goal</p>
          <div className={styles.goalInfo}>
            <p className={styles.goalDescription} style={{ textAlign: 'center' }}>You are about to create a manually updated goal.</p>
            <p className={styles.goalDescription} style={{ textAlign: 'center', marginTop: '1rem' }}>You will be able to update this goal by manually adding or removing funds without linking any transactions.</p>
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={props.togglePopup}>Cancel</button>
            <button className={styles.prevButton} onClick={handleBack}>Previous</button>
            <button className={styles.nextButton} onClick={handleSubmit}>Confirm</button>
          </div>
        </div>
      )}

      {/*5: Adding Transaction Description Keywords*/}
      {step === 5 && updateMethod == 'assign-description' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>Select Transaction Descriptions</p>
          <div className={styles.goalInfo} style={{ height: '100%', justifyContent: 'flex-start', paddingTop: '2rem' }}>
            <p className={styles.goalDescription} style={{ textAlign: 'center' }}>Enter the keyword/s for the transactions you want automatically assigned to this goal.</p>
            <p className={styles.goalDescription} style={{ textAlign: 'center' }}>All transactions with descriptions containing the keyword/s will be assigned to this goal.</p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', width: 'fit-content' }}>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter keyword"
                  style={{ marginRight: '0.5rem', color:'black' }}
                />
                <button onClick={addKeyword} style={{ padding: '0.5rem 1rem', color: "var(--primary-1)", fontWeight: 'bold' }}>Add</button>
              </div>
              <div style={{ marginTop: '2rem' }}>
                {keywords.map((keyword, index) => (
                  <div key={index} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.25rem 0.5rem', borderRadius: '5px', backgroundColor: 'var(--main-background)' }}>
                    <span style={{ marginRight: '1rem' }}>{keyword}</span>
                    <button
                      onClick={() => removeKeyword(keyword)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    > ✕ </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={props.togglePopup}>
              Cancel
            </button>
            <button className={styles.prevButton} onClick={handleBack}>Previous</button>
            <button className={styles.nextButton} onClick={handleSubmit}>Confirm</button>
          </div>
        </div>
      )}

      {/*5: Assigning Categories for Spending Limits*/}
      {step === 5 && updateMethod == 'assign-category' && (
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-[50vw] h-[60vh] flex flex-col justify-between items-center">
          <p className={styles.goalHeading}>Select Spending Category</p>
          <div className={styles.goalInfo}>
            <p className={styles.goalDescription} style={{ textAlign: 'center' }}>Select the category in which you would like to limit your spending.</p>
            <p className={styles.goalDescription} style={{ textAlign: 'center' }}>All transactions for the associated account/s which have this category will be added to this goal.</p>
            <div style={{ marginLeft: '2rem', marginTop: '0.2rem', marginBottom: '1rem' }}>
              <select
                className={`${styles.categoryDropdown} ${getCategoryStyle(selectedCategory)}`}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
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
          <div className={styles.buttonContainer}>
            <button className={styles.cancelButton} onClick={props.togglePopup}>Cancel</button>
            <button className={styles.prevButton} onClick={handleBack}>Previous</button>

            <button className={styles.nextButton} onClick={handleSubmit}>Confirm</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default AddGoalPopup;
