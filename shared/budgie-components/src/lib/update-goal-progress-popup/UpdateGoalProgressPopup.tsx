import React, { useState, useContext, useEffect } from 'react';
import { addDoc, collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import styles from './UpdateGoalProgressPopup.module.css';
import { useThemeSettings } from '../../useThemes';
import '../../root.css';
import {
  useDataContext,
  UserData,
  Goal,
  Account,
  Transaction,
} from '../data-context/DataContext';

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
      className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--main-background)] w-2/3 text-black"
    />
  );
};

export interface UpdateGoalProgressPopupProps {
  togglePopup: () => void;
  goal: any;
}

export function UpdateGoalProgressPopup(props: UpdateGoalProgressPopupProps) {
  useThemeSettings();
  const p = props.goal.type;
  return (
    <div className="text-sm md:text-lg lg:text-xl w-full h-full flex justify-center items-center flex-col bg-black bg-opacity-50">
      <div className="relative w-[90vw] md:w-[60vw] lg:w-[50vw] h-[80vh] md:h-[70vh] lg:h-[60vh] flex flex-col items-center">
        <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-full h-full flex flex-col justify-between items-center mt-12">
          <GoalForm
            activeTab={p}
            togglePopup={props.togglePopup}
            goal={props.goal}
          />
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
  const [currentAmount, setCurrentAmount] = useState(props.goal.current_amount);
  const [targetAmount, setTargetAmount] = useState(props.goal.target_amount);
  const [spendingLimit, setSpendingLimit] = useState(props.goal.spending_limit);
  const [spentAmount, setSpentAmount] = useState(0);
  const [updateAmount, setUpdateAmount] = useState(0);
  const [updateDate, setupdateDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [updateDescription, setUpdateDescription] = useState('');
  const user = useContext(UserContext);
  const { data, setData } = useDataContext();

  interface Goal {
    id: string;
    name: string;
    type: string;
    initial_amount?: number;
    current_amount?: number;
    target_amount?: number;
    target_date?: string;
    spending_limit?: number;
    updates?: string;
    monthly_updates?: string;
    update_type: string;
    accounts: [];
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
    if (updateAmount && goal.current_amount !== undefined) {
      if (goal.initial_amount !== undefined) {
        let amount = goal.current_amount - updateAmount;
        if (amount < 0) {
          amount = 0;
        }
        return amount.toFixed(2);
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
    if (goal.current_amount !== undefined && goal.target_amount == undefined) {
      if (goal.initial_amount !== undefined) {
        return Math.min(
          100,
          ((goal.initial_amount - goal.current_amount + updateAmount) /
            goal.initial_amount) *
            100
        ).toFixed(2);
      }
    }

    return '0.00';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (user && user.uid) {
      e.preventDefault();

      const goalData: any = {
        name: goalName,
        uid: user.uid,
      };

      if (
        props.activeTab === 'Savings' ||
        props.activeTab === 'Debt Reduction'
      ) {
        goalData.current_amount =
          props.activeTab === 'Debt Reduction'
            ? currentAmount - updateAmount
            : currentAmount + updateAmount;
      }
      props.goal.current_amount = goalData.current_amount;

      try {
        const goalDocRef = doc(db, 'goals', props.goal.id);
        const goalDoc = await getDoc(goalDocRef);

        const existingUpdates = goalDoc.exists()
          ? goalDoc.data()?.updates || '[]'
          : '[]';

        let updatesArray = [];
        try {
          updatesArray = JSON.parse(existingUpdates);
        } catch (error) {
          console.error('Error parsing existing updates:', error);
          updatesArray = [];
        }

        const formattedDate = new Date(updateDate)
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '/');

        const newUpdate = {
          amount: updateAmount,
          date: formattedDate,
          description: updateDescription,
        };
        updatesArray.push(newUpdate);
        updatesArray.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const existingMonthlyUpdates = goalDoc.exists()
          ? goalDoc.data()?.monthly_updates || '[]'
          : '[]';

        let updatedMonthlyUpdatesArray = [];
        try {
          updatedMonthlyUpdatesArray = Array.isArray(existingMonthlyUpdates)
            ? existingMonthlyUpdates
            : JSON.parse(existingMonthlyUpdates);
        } catch (error) {
          console.error('Error parsing existing monthly updates:', error);
          updatedMonthlyUpdatesArray = [];
        }

        const newMonthlyUpdate = {
          amount: updateAmount,
          month: getMonthName(updateDate) + ' ' + getYear(updateDate),
        };

        const existingEntryIndex = updatedMonthlyUpdatesArray.findIndex(
          (entry: { month: string }) => entry.month === newMonthlyUpdate.month
        );

        if (existingEntryIndex >= 0) {
          updatedMonthlyUpdatesArray[existingEntryIndex].amount +=
            newMonthlyUpdate.amount;
        } else {
          updatedMonthlyUpdatesArray.push(newMonthlyUpdate);
        }

        updatedMonthlyUpdatesArray.sort(
          (a: any, b: any) =>
            new Date(b.month).getTime() - new Date(a.month).getTime()
        );

        props.goal.monthly_updates = JSON.stringify(updatedMonthlyUpdatesArray);
        props.goal.updates = JSON.stringify(updatesArray);

        await updateDoc(goalDocRef, {
          ...goalData,
          monthly_updates: JSON.stringify(updatedMonthlyUpdatesArray),
          updates: JSON.stringify(updatesArray),
          last_update: new Date().toISOString(),
        });

        const updatedGoals = data.goals.map((goal) =>
          goal.id === props.goal.id
            ? {
                ...goal,
                current_amount: goalData.current_amount!,
                monthly_updates: JSON.stringify(updatedMonthlyUpdatesArray),
                updates: JSON.stringify(updatesArray),
              }
            : goal
        );

        setData({
          ...data,
          goals: updatedGoals,
        });

        props.togglePopup();
      } catch (error) {
        console.error('Error saving goal:', error);
      }
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

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const currentMonthName = monthNames[currentMonthIndex];

  const monthlyBudgetSpent = (month: number): number => {
    if (props.goal.monthly_updates !== undefined) {
      const data = JSON.parse(props.goal.monthly_updates);
      const currentMonthYear = `${currentMonthName} ${currentYear}`;
      const currentMonthData = data.find(
        (item: { month: string }) => item.month === currentMonthYear
      );
      const amountForCurrentMonth = currentMonthData
        ? currentMonthData.amount
        : 0;
      return amountForCurrentMonth;
    }
    return 0;
  };

  const calculateNewAmountSpent = (dateString: string): string => {

    const amountLeft = spendingLimit - calculateNewAmountLeft(dateString)

    return (amountLeft).toFixed(2);
  };

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
  
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  }

  const calculateNewAmountLeft = (date: string): number => {
    const formattedDate = formatDate(date);
    const monthlyAmounts = JSON.parse(props.goal.monthly_updates);
    const entry = monthlyAmounts.find((item: { month: string }) => item.month === formattedDate);
    const monthAmount = entry ? entry.amount : 0;
    const newAmount = spendingLimit - monthAmount - updateAmount;

    return (newAmount);
  };

  useEffect(() => {
    function getMonthAmount() {
      const dateToFind = getMonthName(updateDate) + ' ' + getYear(updateDate);
      const spendingArray: SpentAmount[] = props.goal.monthly_updates
        ? JSON.parse(props.goal.monthly_updates)
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
    <div className="w-full flex flex-col space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full justify-between space-y-6"
      >
        <p className={styles.goalHeading}>
          Add a manual update to {props.goal.name} below:
        </p>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-4">
            <label className="font-medium text-[var(--primary-text)] w-1/3 text-left">
              Date:
            </label>
            <input
              type="date"
              value={updateDate || ''}
              onChange={(e) => setupdateDate(e.target.value)}
              required
              className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--main-background)] w-2/3 text-black"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-4">
            <label className="font-medium text-[var(--primary-text)] w-1/3 text-left">
              Amount:
            </label>
            <ClearableInput value={updateAmount} onChange={setUpdateAmount} />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-4">
            <label className="font-medium text-[var(--primary-text)] w-1/3 text-left">
              Description:
            </label>
            <input
              type="text"
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              required
              className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--main-background)] text-black w-2/3"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex flex-col md:flex-row md:justify-between space-y-2 md:space-y-0">
            {props.activeTab === 'Savings' && (
              <>
                <div className="flex flex-col space-y-1 bg-[var(--main-background)] rounded p-2">
                  <div className="font-medium ">New Savings Amount:</div>
                  <p>R {calculateNewCurrentAmount(props.goal)}</p>
                </div>
                <div className="flex flex-col space-y-1 bg-[var(--main-background)] rounded p-2">
                  <div className="font-medium">New Savings Progress:</div>
                  <p>{calculateNewProgress(props.goal)}%</p>
                </div>
              </>
            )}
            {props.activeTab === 'Debt Reduction' && (
              <>
                <div className="flex flex-col space-y-1 bg-[var(--main-background)] rounded p-2">
                  <div className="font-medium ">New Debt Amount:</div>
                  <p>R {calculateNewCurrentAmount(props.goal)}</p>
                </div>
                <div className="flex flex-col space-y-1 bg-[var(--main-background)] rounded p-2">
                  <div className="font-medium">New Goal Progress:</div>
                  <p>{calculateNewProgress(props.goal)}%</p>
                </div>
              </>
            )}
            {props.activeTab === 'Spending Limit' && (
              <>
                <div className="flex flex-col space-y-1 bg-[var(--main-background)] rounded p-2">
                  <div className="font-medium ">New Amount Spent:</div>
                  <p>R {calculateNewAmountSpent(updateDate)}</p>
                </div>
                <div className="flex flex-col space-y-1 bg-[var(--main-background)] rounded p-2">
                  <div className="font-medium">New Amount Left in Budget:</div>
                  <p>R {calculateNewAmountLeft(updateDate).toFixed(2)}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="p-2 bg-[var(--primary-1)] text-[var(--secondary-text)] cursor-pointer transition ease-in-out duration-300 rounded-md text-center font-bold hover:bg-[var(--block-background)] border border-[var(--primary-1)] hover:text-[var(--primary-1)]"
        >
          Save
        </button>
        <button
          className="mt-2 bg-[var(--main-background)] w-full p-2 text-[var(--primary-1)] border-none cursor-pointer transition ease-in-out duration-300 rounded-md text-center font-bold hover:bg-[var(--block-background)]"
          onClick={props.togglePopup}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default UpdateGoalProgressPopup;
