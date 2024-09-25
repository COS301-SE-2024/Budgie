import React, { useState, useContext, useEffect } from 'react';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import styles from './EditGoalPopup.module.css';
import '../../root.css';

/* eslint-disable-next-line */

type Condition = {
  accounts: string[];
  keywords: string[];
  category: string;
};

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
  const [activeTab, setActiveTab] = useState('details'); // Track active tab

  return (
    <div className="fixed top-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50000 w-[85vw] text-sm md:text-lg lg:text-xl">
      <div className="relative w-[50vw] h-[60vh] flex flex-col items-center">
        {props.goal.update_type == 'automatic' && (
          <div className="flex w-full absolute top-0">
            <button
              className={`w-1/2 px-4 py-2 font-bold transition-colors rounded-t-lg ${activeTab === 'details'
                ? 'bg-[var(--primary-1)] text-white'
                : 'bg-gray-200 text-black'
                }`}
              onClick={() => setActiveTab('details')}
              style={{ marginRight: '0.5rem' }}
            >
              Edit Goal Details
            </button>
            <button
              className={`w-1/2 px-4 py-2 font-bold transition-colors rounded-t-lg ${activeTab === 'conditions'
                ? 'bg-[var(--primary-1)] text-white'
                : 'bg-gray-200 text-black'
                }`}
              onClick={() => setActiveTab('conditions')}
            >
              Edit Update Conditions
            </button>
          </div>
        )}
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-full h-full flex flex-col justify-between items-center mt-12">
          {activeTab === 'details' && (
            <GoalForm
              togglePopup={props.togglePopup}
              goal={props.goal}
              toggleMainPopup={props.toggleMainPopup}
            />
          )}
          {activeTab === 'conditions' && (
            <ConditionsTab
              togglePopup={props.togglePopup}
              goal={props.goal}
              toggleMainPopup={props.toggleMainPopup}
            />
          )}
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
  goal: Goal;
}

const GoalForm: React.FC<GoalFormProps> = (props: GoalFormProps) => {
  const [goalName, setGoalName] = useState(props.goal.name);
  const [currentAmount, setCurrentAmount] = useState(props.goal.current_amount);
  const [targetAmount, setTargetAmount] = useState(props.goal.target_amount);
  const [targetDate, setTargetDate] = useState(props.goal.target_date);
  const [spendingLimit, setSpendingLimit] = useState(props.goal.spending_limit);
  const user = useContext(UserContext);


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

  const handleSubmit = async (e: React.FormEvent) => {
    if (user) {
      e.preventDefault();

      if (goalName != props.goal.name) {
        const goalNameExists = checkGoalExists(goalName);
        if (await goalNameExists) {
          alert('You already have a goal with this name.');
          return;
        }
      }

      const goalData: any = {
        type: props.goal.type,
        name: goalName,
        uid: user.uid,
      };

      props.goal.name = goalName;

      if (props.goal.type === 'Savings') {
        goalData.current_amount = currentAmount;
        props.goal.current_amount = currentAmount;
        goalData.target_amount = targetAmount;
        props.goal.target_amount = targetAmount;
        goalData.target_date = targetDate;
        props.goal.target_date = targetDate;
      } else if (props.goal.type === 'Debt Reduction') {
        goalData.current_amount = currentAmount;
        props.goal.current_amount = currentAmount;
        goalData.target_date = targetDate;
        props.goal.target_date = targetDate;
      } else if (props.goal.type === 'Spending Limit') {
        goalData.spending_limit = spendingLimit;
        props.goal.spending_limit = spendingLimit;
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
      try {
        const goalDocRef = doc(db, 'goals', props.goal.id);
        await updateDoc(goalDocRef, { uid: 'User has deleted this goal.' });
        props.togglePopup();
        props.toggleMainPopup();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  return (
    <div className={styles.goalForm}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
        <p className={styles.goalDescription}>
          Editing {props.goal.name}:
          <button className={styles.deleteButton} onClick={handleDelete}>
            Delete Goal
          </button>
        </p>
        <div>
          {props.goal.type === 'Savings' && targetAmount && (
            <>
              <div className={styles.formGroup}>
                <label>Goal Name:</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Target Savings Amount:</label>
                <ClearableInput value={targetAmount} onChange={setTargetAmount} />
              </div>
              <div className={styles.formGroup}>
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
                <label>Goal Name:</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
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

          {props.goal.type === 'Spending Limit' && spendingLimit && (
            <>
              <div className={styles.formGroup}>
                <label>Goal Name:</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Spending Limit per Month:</label>
                <ClearableInput
                  value={spendingLimit}
                  onChange={setSpendingLimit}
                />
              </div>
            </>
          )}
        </div>
        <button type="submit" className={styles.saveButton}>Save</button>
      </form>
    </div>
  );
};

interface ConditionsTabProps {
  togglePopup: () => void;
  goal: any;
  toggleMainPopup: () => void;
}

const ConditionsTab: React.FC<ConditionsTabProps> = ({
  togglePopup,
  goal,
  toggleMainPopup,
}) => {

  const [conditions, setConditions] = useState<Condition[]>(
    () => goal.conditions ? JSON.parse(goal.conditions) : []
  );
  const [description, setDescription] = useState('');
  const [accountOptions, setAccountOptions] = useState<{ alias: string; accountNumber: string }[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Any');
  const [step, setStep] = useState(1);
  const [keywords, setKeywords] = useState<string[]>([]);
  const user = useContext(UserContext);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlias, setSelectedAlias] = useState<string>('');
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>('');

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

  const handleSubmit = async () => {
    goal.conditions = JSON.stringify(conditions);
    const goalData: any = {
      conditions: JSON.stringify(conditions)
    };
    try {
      const goalDocRef = doc(db, 'goals', goal.id);
      await updateDoc(goalDocRef, goalData);
      togglePopup();
    } catch (error) {
      console.error('Error saving goal:', error);
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


  const handleNext = async () => {
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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


  return (
    <>
      {step === 1 && (
        <div style={{height:'100%', display:'flex',flexDirection:'column', justifyContent:'space-between'}}>
          <p className={styles.goalHeading}>Set Automatic Update Conditions</p>
          <div className="flex flex-col items-center w-full max-h-[40vh]">
            <p className={styles.goalDescription} style={{ textAlign: 'center' }}>
              Set the conditions for the transactions you want to be associated with this goal. Transactions meeting any of the conditions you set will be associated with the goal.
            </p>
            <button onClick={handleNext} style={{ padding: '0.5rem 1rem', color: "var(--primary-1)", fontWeight: 'bold', marginBottom: '1vh' }}>Add Condition</button>

            {/* Scrollable Section for Added Conditions */}
            {conditions.length > 0 && (
              <div className="flex-grow border overflow-y-auto p-4 mb-4" style={{ backgroundColor: 'var(--main-background)', width: '100%', border: '2px solid var(--primary-1)' }}>
                {conditions.map((condition: Condition, index: number) => (
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
          {conditions.length > 0 && (
            <button className={styles.saveButton} onClick={handleSubmit}>Save</button>
          )}
        </div>

      )}

      {step === 2 && (
        <>
          <p className={styles.goalHeading} style={{ marginBottom: '0' }}>Add Condition</p>
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
            <button className={styles.prevButton} onClick={handleBack}>
              Back
            </button>
            <button className={styles.nextButton} onClick={addCondition}>
              Add
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default EditGoalPopup;
