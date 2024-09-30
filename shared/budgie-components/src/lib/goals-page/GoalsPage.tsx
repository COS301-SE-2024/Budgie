'use client';

import React, { useEffect, useState, useContext } from 'react';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Label,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import AddGoalPopup from '../add-goal-popup/AddGoalPopup';
import EditGoalPopup from '../edit-goal-popup/EditGoalPopup';
import styles from './GoalsPage.module.css';
import UpdateGoalPopup from '../update-goal-progress-popup/UpdateGoalProgressPopup';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import '../../root.css';
import {
  useDataContext,
  Goal,
  Transaction,
} from '../data-context/DataContext';

import Image from 'next/image';

import gif1 from '../../../public/images/birdgif1.gif';
import gif2 from '../../../public/images/birdgif2.gif';
import gif3 from '../../../public/images/birdgif3.gif';
import gif4 from '../../../public/images/birdgif4.gif';
import gif5 from '../../../public/images/birdgif5.gif';
import gif6 from '../../../public/images/birdgif6.gif';

interface Condition {
  accounts: string[];
  keywords: string[];
  category: string;
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

interface Update {
  amount: number;
  date: string;
  description?: string;
  category?: string;
}

export interface TableProps {
  goal: Goal;
}

const UpdateTable = ({
  goal,
  onUpdateGoal,
}: TableProps & { onUpdateGoal: (goal: Goal) => void }) => {
  const [localUpdates, setLocalUpdates] = useState<Update[]>(
    goal.updates ? JSON.parse(goal.updates) : []
  );
  const { data, setData } = useDataContext();

  const handleDeleteUpdate = async (
    amount: number,
    date: string,
    description: string
  ) => {
    if (
      window.confirm(
        'Do you really want to delete this update? The transaction will not be automatically added back to this goal.'
      ) &&
      goal.updates
    ) {
      let updatedCurrentAmount = goal.current_amount;
      const newUpdates: Update[] = [];
      const deletedUpdates: Update[] = goal.deleted_updates
        ? JSON.parse(goal.deleted_updates)
        : [];

      if (goal.type === 'Debt Reduction') {
        updatedCurrentAmount += amount;
      } else {
        updatedCurrentAmount -= amount;
      }

      let removed = false;
      for (let i = 0; i < localUpdates.length; i++) {
        const update = localUpdates[i];
        if (
          !removed &&
          update.amount === amount &&
          update.date === date &&
          update.description === description
        ) {
          deletedUpdates.push(update);
          continue;
        }
        newUpdates.push(update);
      }

      let monthlyUpdatesArray = goal.monthly_updates
        ? JSON.parse(goal.monthly_updates)
        : [];
      const updateMonth = new Date(date).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      const monthlyUpdateIndex = monthlyUpdatesArray.findIndex(
        (entry: { month: string }) => entry.month === updateMonth
      );

      if (monthlyUpdateIndex >= 0) {
        monthlyUpdatesArray[monthlyUpdateIndex].amount -= amount;
        if (monthlyUpdatesArray[monthlyUpdateIndex].amount == 0) {
          monthlyUpdatesArray.splice(monthlyUpdateIndex, 1);
        }
      }

      goal.current_amount = updatedCurrentAmount;
      goal.updates = JSON.stringify(newUpdates);
      goal.deleted_updates = JSON.stringify(deletedUpdates);
      goal.monthly_updates = JSON.stringify(monthlyUpdatesArray);

      setLocalUpdates(newUpdates);
      onUpdateGoal(goal);
      try {
        const goalData: any = {
          updates: goal.updates,
          deleted_updates: goal.deleted_updates,
          current_amount: goal.current_amount,
          monthly_updates: goal.monthly_updates,
        };

        const goalDocRef = doc(db, 'goals', goal.id);
        await updateDoc(goalDocRef, goalData);

        const updatedGoals = data.goals.map((g) =>
          g.id === goal.id
            ? {
                ...g,
                updates: goal.updates,
                deleted_updates: goal.deleted_updates,
                current_amount: goal.current_amount,
                monthly_updates: goal.monthly_updates,
              }
            : g
        );

        setData({
          ...data,
          goals: updatedGoals,
        });
      } catch (error) {
        console.error('Error saving goal:', error);
      }
    }
  };

  useEffect(() => {
    if (goal.updates) {
      try {
        const parsedUpdates = JSON.parse(goal.updates);
        setLocalUpdates(parsedUpdates);
      } catch (error) {
        console.error('Failed to parse updates', error);
      }
    }
  }, [goal.updates, goal.current_amount]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead>
          <tr
            style={{
              color: 'var(--secondary-text)',
              backgroundColor: 'var(--primary-1)',
            }}
            className="text-left text-sm"
          >
            <th
              className="border p-2 text-center w-12"
              style={{
                backgroundColor: 'var(--block-background)',
                borderLeft: '1px solid var(--block-background)',
                borderTop: '1px solid var(--block-background)',
                borderBottom: '1px solid var(--block-background)',
              }}
            ></th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {localUpdates.map((update: Update, index: number) => (
            <tr
              key={index}
              className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 text-sm"
              style={{
                backgroundColor: 'var(--block-background)',
                fontSize: 'calc(1.2rem * var(--font-size-multiplier))',
              }}
            >
              <td
                className="border p-2 text-center"
                style={{
                  width: '1%',
                  borderLeft: '1px solid var(--block-background)',
                  borderBottom: '1px solid var(--block-background)',
                }}
              >
                <span
                  className="cursor-pointer"
                  style={{ color: 'red' }}
                  onClick={() =>
                    handleDeleteUpdate(
                      update.amount,
                      update.date,
                      update.description || ''
                    )
                  }
                >
                  &#x2716;
                </span>
              </td>
              <td className="border p-2">R {update.amount.toFixed(2)}</td>
              <td className="border p-2">{update.date}</td>
              <td className="border p-2">
                {update.description || 'Manual Update'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export interface GoalInfoPageProps {
  goal: Goal;
  onClose: () => void;
}

const GoalInfoPage = ({
  goal,
  onClose,
  onUpdateGoal,
}: GoalInfoPageProps & { onUpdateGoal: (goal: Goal) => void }) => {
  const [updatePopupOpen, setUpdatePopupOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(goal);
  const [editPopupOpen, setEditPopupOpen] = useState(false);

  const handleGoalUpdate = (updatedGoal: Goal) => {
    setCurrentGoal({ ...updatedGoal });
    onUpdateGoal(updatedGoal);
  };

  const handleUpdateGoalPopup = () => {
    setUpdatePopupOpen(!updatePopupOpen);
    setEditPopupOpen(false);
  };

  const handleEditGoalPopup = () => {
    setEditPopupOpen(!editPopupOpen);
    setUpdatePopupOpen(false);
  };

  const monthlyBudgetSpent = (goal: Goal): number => {
    if (goal.monthly_updates !== undefined && goal.monthly_updates !== '') {
      const data = JSON.parse(goal.monthly_updates);
      const currentMonthYear = `${
        monthNames[new Date().getMonth()]
      } ${new Date().getFullYear()}`;
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

  const calculateProgressPercentage = (goal: Goal): number => {
    if (
      goal.current_amount !== undefined &&
      goal.initial_amount !== undefined &&
      goal.type == 'Debt Reduction'
    ) {
      if (goal.initial_amount) {
        return Math.min(
          100,
          ((goal.initial_amount - goal.current_amount) / goal.initial_amount) *
            100
        );
      } else {
        return Math.min(100, goal.current_amount * 100);
      }
    }

    if (
      goal.current_amount !== undefined &&
      goal.target_amount !== undefined &&
      goal.type == 'Savings'
    ) {
      return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
    }

    if (
      goal.spending_limit !== undefined &&
      goal.monthly_updates !== undefined &&
      goal.type == 'Spending Limit'
    ) {
      const amountForCurrentMonth = monthlyBudgetSpent(goal);
      return (amountForCurrentMonth / goal.spending_limit) * 100;
    }
    return 0;
  };

  const calculateDaysLeft = (targetDate: string): number => {
    const currentDate = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getGif = (progress: number) => {
    if (progress <= 15) return gif1;
    if (progress <= 40) return gif2;
    if (progress <= 60) return gif3;
    if (progress <= 80) return gif4;
    if (progress < 100) return gif5;
    return gif6;
  };

  const getColorForValue = (value: number, type: string): string => {
    if (value < 100) return 'var(--primary-1)';
    if (type == 'Spending Limit' && value >= 100) return '#FF0000';
    return '#46981d';
  };

  const getUpdates = () => {
    if (goal.monthly_updates) {
      const updatesData = JSON.parse(goal.monthly_updates);

      updatesData.sort((a: { month: string }, b: { month: string }) => {
        return new Date(a.month).getTime() - new Date(b.month).getTime();
      });

      return updatesData.map((update: { month: string; amount: number }) => ({
        month: update.month,
        amount: update.amount.toFixed(2),
      }));
    }
    return [];
  };

  const timeSinceLastUpdate = (lastUpdate: string): string => {
    const now = new Date();
    const lastUpdateDate = new Date(lastUpdate);

    const diffInMilliseconds = now.getTime() - lastUpdateDate.getTime();

    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  const calculateRemainingSavings = (goal: Goal): number => {
    if (goal.target_amount != undefined && goal.current_amount != undefined) {
      return goal.target_amount - goal.current_amount;
    }
    return 0;
  };

  const calculateAverageSavings = (goal: Goal): number => {
    if (goal.monthly_updates) {
      const monthlyUpdates = JSON.parse(goal.monthly_updates);
      const totalSaved = monthlyUpdates.reduce(
        (sum: number, update: { amount: number }) => sum + update.amount,
        0
      );
      return totalSaved / monthlyUpdates.length;
    }
    return 0;
  };

  const calculateSavingsPerMonth = (goal: Goal): number => {
    if (
      goal.target_amount != undefined &&
      goal.current_amount != undefined &&
      goal.target_date !== undefined
    ) {
      const months = Math.max(1, calculateMonthsLeft(goal.target_date));
      return (goal.target_amount - goal.current_amount) / months;
    }
    return 0;
  };

  const calculateMonthsLeft = (targetDate: string): number => {
    const currentDate = new Date();
    const target = new Date(targetDate);
    const diffMonths =
      (target.getFullYear() - currentDate.getFullYear()) * 12 +
      (target.getMonth() - currentDate.getMonth());
    return Math.max(diffMonths, 0);
  };

  const calculateAverageSpending = (goal: Goal): number => {
    if (goal.monthly_updates) {
      const monthlyUpdates = JSON.parse(goal.monthly_updates);
      const totalSpent = monthlyUpdates.reduce(
        (sum: number, update: { amount: number }) => sum + update.amount,
        0
      );
      return totalSpent / monthlyUpdates.length;
    }
    return 0;
  };

  const calculateSpendingDifferencePercentage = (goal: Goal): number => {
    const averageSpending = calculateAverageSpending(goal);
    const monthlyLimit = goal.spending_limit || 0;
    return ((averageSpending - monthlyLimit) / monthlyLimit) * 100;
  };

  const calculateBiggestExpense = (goal: Goal): Update => {
    if (goal.updates) {
      const updates = JSON.parse(goal.updates);
      return updates.reduce((biggest: Update, current: Update) => {
        return current.amount > biggest.amount ? current : biggest;
      }, updates[0]);
    }
    return { amount: 0, date: '', description: '' };
  };

  const calculateBiggestExpenseMonth = (goal: Goal): string => {
    const biggestExpense = calculateBiggestExpense(goal);
    return new Date(biggestExpense.date).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateBiggestExpensePercentage = (goal: Goal): number => {
    const biggestExpense = calculateBiggestExpense(goal);
    const monthlyLimit = goal.spending_limit || 1;
    return (biggestExpense.amount / monthlyLimit) * 100;
  };

  const calculateRemainingDebt = (goal: Goal): number => {
    if (goal.initial_amount && goal.current_amount) {
      return goal.current_amount;
    }
    return 0;
  };

  const calculateAverageDebtPayments = (goal: Goal): number => {
    if (goal.monthly_updates) {
      const monthlyUpdates = JSON.parse(goal.monthly_updates);
      const totalPaid = monthlyUpdates.reduce(
        (sum: number, update: { amount: number }) => sum + update.amount,
        0
      );
      return totalPaid / monthlyUpdates.length;
    }
    return 0;
  };

  return (
    <div className="flex flex-col h-full overflow-y-hidden">
      <div
        className="flex flex-col lg:flex-row justify-center lg:justify-between w-full items-center container mx-auto pb-4"
        style={{ borderBottom: '1px solid gray' }}
      >
        <div className="flex justify-between items-center w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--primary-1)] flex items-center mr-[0.5rem] lg:mr-[1rem]">
            <span
              className="material-symbols-outlined mr-[0.5rem] sm:mr-[1rem] text-[1.25rem] sm:text-[calc(1.5rem * var(--font-size-multiplier))] cursor-pointer"
              onClick={onClose}
            >
              arrow_back
            </span>
            {goal.name}
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            <div
              className="h-full p-2 text-[var(--primary-1)] border-none cursor-pointer transition ease-in-out duration-300 rounded-md text-center font-bold hover:bg-[var(--block-background)]"
              onClick={handleEditGoalPopup}
            >
              Edit Goal Details
            </div>
            <div
              className="h-full p-2 bg-[var(--primary-1)] text-[var(--secondary-text)] cursor-pointer transition ease-in-out duration-300 rounded-md text-center font-bold hover:bg-[var(--block-background)] border border-[var(--primary-1)] hover:text-[var(--primary-1)]"
              onClick={handleUpdateGoalPopup}
            >
              Add an Update
            </div>
          </div>
        </div>
      </div>
      {!editPopupOpen && !updatePopupOpen && (
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <div className="container mx-auto p-4">
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-x-4 lg:space-y-0 h-fit">
              <div className="lg:w-1/2 flex flex-col items-center justify-between text-center bg-[var(--block-background)] rounded-lg shadow-md p-8 w-full">
                <h2 className="text-xl font-semibold mb-4">Goal Details</h2>
                <div className="flex flex-col space-y-2 h-full justify-center">
                  <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                    <div className="font-bold whitespace-nowrap mr-[5rem]">
                      Goal Type:
                    </div>
                    <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                      {goal.type}
                    </div>
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                    <div className="font-bold whitespace-nowrap mr-[5rem]">
                      Update Type:
                    </div>
                    <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                      {goal.update_type === 'automatic'
                        ? 'Automatic'
                        : 'Manual Only'}
                    </div>
                  </div>

                  {goal.initial_amount !== undefined && (
                    <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                      <div className="font-bold whitespace-nowrap">
                        Initial Amount:
                      </div>
                      <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                        R {goal.initial_amount.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {goal.current_amount !== undefined &&
                    goal.type !== 'Spending Limit' && (
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                        <div className="font-bold whitespace-nowrap">
                          Current Amount:
                        </div>
                        <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                          R {goal.current_amount.toFixed(2)}
                        </div>
                      </div>
                    )}

                  {goal.spending_limit !== undefined &&
                    goal.type === 'Spending Limit' && (
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                        <div className="font-bold whitespace-nowrap">
                          Monthly Limit:
                        </div>
                        <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                          R {goal.spending_limit.toFixed(2)}
                        </div>
                      </div>
                    )}

                  {goal.monthly_updates !== undefined &&
                    goal.type === 'Spending Limit' && (
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                        <div className="font-bold whitespace-nowrap">
                          Spent this Month:
                        </div>
                        <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                          R {monthlyBudgetSpent(goal).toFixed(2)}
                        </div>
                      </div>
                    )}

                  {goal.target_amount !== undefined && (
                    <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                      <div className="font-bold whitespace-nowrap">
                        Target Amount:
                      </div>
                      <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                        R {goal.target_amount.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {goal.target_date !== undefined && (
                    <>
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                        <div className="font-bold whitespace-nowrap">
                          Target Date:
                        </div>
                        <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                          {goal.target_date}
                        </div>
                      </div>
                      <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                        <div className="font-bold whitespace-nowrap">
                          Days Left:
                        </div>
                        <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                          {calculateDaysLeft(goal.target_date) > 0
                            ? `${calculateDaysLeft(goal.target_date)} days`
                            : 'Date Passed'}
                        </div>
                      </div>
                    </>
                  )}

                  {goal.last_update !== undefined && (
                    <div className="flex flex-wrap md:flex-nowrap justify-between items-center space-x-2">
                      <div className="font-bold whitespace-nowrap">
                        Last Update:
                      </div>
                      <div className="text-right md:text-left text-[var(--primary-1)] whitespace-nowrap">
                        {timeSinceLastUpdate(goal.last_update)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:w-1/4 flex flex-col items-center justify-between text-center bg-[var(--block-background)] rounded-lg shadow-md p-8 w-full">
                <h2 className="text-xl font-semibold mb-4">
                  {goal.type !== 'Spending Limit'
                    ? 'Overall Goal Progress'
                    : 'Spent This Month'}
                </h2>
                <div className="relative flex-grow flex justify-center items-center h-full w-full">
                  <div className="w-[20vh] h-[20vh]">
                    <CircularProgressbar
                      value={calculateProgressPercentage(goal)}
                      styles={buildStyles({
                        pathColor: getColorForValue(
                          calculateProgressPercentage(goal),
                          goal.type
                        ),
                        trailColor: '#d6d6d6',
                        strokeLinecap: 'round',
                      })}
                    />
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold"
                      style={{
                        color: getColorForValue(
                          calculateProgressPercentage(goal),
                          goal.type
                        ),
                      }}
                    >
                      {`${calculateProgressPercentage(goal).toFixed(2)}%`}
                    </div>
                  </div>
                </div>
              </div>

              {goal.type !== 'Spending Limit' && (
                <div className="lg:w-1/4 flex flex-col items-center justify-between text-center bg-[var(--block-background)] rounded-lg shadow-md p-8 w-full">
                  <h2 className="text-xl font-semibold mb-4">Goal Wingman</h2>
                  <div className="w-full flex items-center justify-center">
                    <Image
                      src={getGif(calculateProgressPercentage(goal))}
                      alt="Goal GIF"
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="container mx-auto p-4">
            <div className="flex flex-col justify-center items-center bg-[var(--block-background)] rounded-lg shadow-md p-8 w-full">
              <h2 className="text-xl font-semibold mb-4">Insights</h2>
              <div
                className="justify-left items-left bg-grey w-full"
                style={{
                  fontSize: 'calc(1.2rem*var(--font-size-multiplier))',
                }}
              >
                <div
                  className="justify-left items-left bg-grey w-full"
                  style={{
                    fontSize: 'calc(1.2rem*var(--font-size-multiplier))',
                  }}
                >
                  {goal.target_date &&
                    calculateMonthsLeft(goal.target_date) <= 0 &&
                    calculateDaysLeft(goal.target_date) <= 0 && (
                      <>
                        <p>This goal's target date has passed.</p>
                        <br></br>
                        <p>
                          You can set a new date by clicking "Edit Details"
                          above.
                        </p>
                      </>
                    )}
                  {goal.type === 'Savings' &&
                    goal.target_amount &&
                    goal.target_amount > goal.current_amount &&
                    goal.target_date && (
                      <>
                        <div className="flex flex-wrap">
                          <p>You still need to save</p>
                          <p className="text-[var(--primary-1)] font-semibold ml-1">
                            R{calculateRemainingSavings(goal).toFixed(2)}
                          </p>
                          <p>.</p>
                        </div>
                        <br></br>
                        <div className="flex flex-wrap">
                          <p>This means you need to save </p>
                          <p className="text-[var(--primary-1)] font-semibold ml-1 mr-1">
                            R{calculateSavingsPerMonth(goal).toFixed(2)}
                          </p>
                          <p>per month in order to reach your goal in time.</p>
                        </div>

                        {goal.updates &&
                          JSON.parse(goal.updates).length > 0 && (
                            <>
                              <br></br>
                              <div className="flex flex-wrap">
                                <p>
                                  The average amount you have saved per month is
                                </p>
                                <p className="text-[var(--primary-1)] font-semibold ml-1">
                                  R{calculateAverageSavings(goal).toFixed(2)}
                                </p>
                                <p>.</p>
                                <br></br>
                              </div>
                            </>
                          )}
                      </>
                    )}
                  {goal.type === 'Savings' &&
                    goal.target_amount &&
                    goal.target_amount <= goal.current_amount && (
                      <p>You've reached your goal!</p>
                    )}
                  {goal.type === 'Spending Limit' && goal.spending_limit && (
                    <>
                      {goal.spending_limit - monthlyBudgetSpent(goal) > 0 && (
                        <>
                          <div className="flex flex-wrap">
                            <p>You still have</p>
                            <p className="text-[var(--primary-1)] font-semibold ml-1 mr-1">
                              R
                              {(
                                goal.spending_limit - monthlyBudgetSpent(goal)
                              ).toFixed(2)}
                            </p>
                            <p>in your limit this month.</p>
                          </div>
                          <br></br>
                        </>
                      )}
                      {goal.spending_limit - monthlyBudgetSpent(goal) <= 0 && (
                        <>
                          <div className="flex flex-wrap">
                            <p>You have exceeded this month's limit by</p>
                            <p className="text-[var(--primary-1)] font-semibold ml-1">
                              R
                              {(
                                -goal.spending_limit + monthlyBudgetSpent(goal)
                              ).toFixed(2)}
                            </p>
                            <p>.</p>
                          </div>
                          <br></br>
                        </>
                      )}
                      <div className="flex flex-wrap">
                        <p>On average, you have spent</p>
                        <p className="text-[var(--primary-1)] font-semibold ml-1 mr-1">
                          R{calculateAverageSpending(goal).toFixed(2)}
                        </p>
                        <p>per month.</p>
                      </div>
                      <br></br>
                      <div className="flex flex-wrap">
                        <p>Your average spending is</p>
                        <p className="text-[var(--primary-1)] font-semibold ml-1 mr-1">
                          {Math.abs(
                            calculateSpendingDifferencePercentage(goal)
                          ).toFixed(2)}
                          %
                        </p>
                        <p>
                          {calculateSpendingDifferencePercentage(goal) > 0
                            ? 'above'
                            : 'below'}{' '}
                          your monthly limit.
                        </p>
                      </div>

                      {goal.updates && JSON.parse(goal.updates).length > 0 && (
                        <>
                          <br></br>
                          <div className="flex flex-wrap">
                            <p> Your biggest expense was "</p>
                            <p className="text-[var(--primary-1)] font-semibold ml-1 mr-1">
                              {calculateBiggestExpense(goal).description}
                            </p>
                            <p>" in</p>
                            <p className="text-[var(--primary-1)] font-semibold ml-1">
                              {calculateBiggestExpenseMonth(goal)}
                            </p>
                            <p>, which used</p>
                            <p className="text-[var(--primary-1)] font-semibold ml-1 mr-1">
                              {calculateBiggestExpensePercentage(goal).toFixed(
                                2
                              )}
                              %
                            </p>
                            <p>of that month's limit.</p>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  {goal.type === 'Debt Reduction' &&
                    goal.target_date !== undefined &&
                    goal.current_amount > 0 &&
                    goal.target_date &&
                    calculateMonthsLeft(goal.target_date) > 0 && (
                      <>
                        <div className="flex flex-wrap">
                          <p>You still need to pay</p>
                          <p className="text-[var(--primary-1)] font-semibold ml-1 mr-1">
                            R{calculateRemainingDebt(goal).toFixed(2)}{' '}
                          </p>
                          <p>towards this debt.</p>
                        </div>
                        <br></br>
                        <div className="flex flex-wrap">
                          <p>This means you need to pay</p>
                          <p className="text-[var(--primary-1)] font-semibold ml-1 mr-1">
                            R
                            {(
                              calculateRemainingDebt(goal) /
                              calculateMonthsLeft(goal.target_date)
                            ).toFixed(2)}
                          </p>
                          <p>per month in order to reach your goal in time.</p>
                        </div>

                        {goal.updates &&
                          JSON.parse(goal.updates).length > 0 && (
                            <>
                              <br></br>
                              <div className="flex flex-wrap">
                                <p>Your average monthly payment is</p>
                                <p className="text-[var(--primary-1)] font-semibold ml-1">
                                  R
                                  {calculateAverageDebtPayments(goal).toFixed(
                                    2
                                  )}
                                </p>
                                <p>.</p>
                              </div>
                            </>
                          )}
                      </>
                    )}
                  {goal.type === 'Debt Reduction' &&
                    goal.current_amount <= 0 && (
                      <p>You've reached your goal!</p>
                    )}
                </div>
              </div>
            </div>
          </div>

          {goal.updates && JSON.parse(goal.updates).length > 0 && (
            <>
              <div className="container mx-auto p-4">
                <div className="flex justify-between items-start gap-8">
                  <div className="flex-1 flex flex-col justify-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8 pl-4 pr-4 h-[40vh]">
                    <h2 className="text-xl font-semibold mb-10">
                      {goal.type != 'Spending Limit'
                        ? 'Goal Progress Over Time'
                        : 'Spending by Month'}
                    </h2>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart
                        data={getUpdates()}
                        margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                        startAngle={180}
                      >
                        <XAxis
                          dataKey="month"
                          stroke="var(--main-text)"
                          tick={{ fill: 'var(--main-text)', fontSize: 12 }}
                        />
                        <YAxis
                          tick={{ fill: 'var(--main-text)', fontSize: 12 }}
                          stroke="var(--main-text)"
                          width={50}
                          allowDataOverflow={true}
                          domain={['auto', 'auto']}
                        >
                          <Label
                            value="Amount"
                            angle={-90}
                            position="insideLeft"
                            style={{
                              textAnchor: 'middle',
                              fill: 'var(--main-text)',
                              fontSize: '14px',
                            }}
                          />
                        </YAxis>
                        <Tooltip
                          cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                          contentStyle={{
                            backgroundColor: 'var(--main-background)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px',
                          }}
                        />
                        <CartesianGrid
                          stroke="rgba(255, 255, 255, 0.1)"
                          vertical={false}
                        />
                        <Bar
                          dataKey="amount"
                          fill="var(--primary-1)"
                          barSize={40}
                          stroke="var(--main-border)"
                          strokeWidth={1}
                        >
                          {getUpdates().map(
                            (entry: { amount: number }, index: any) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  goal.type === 'Spending Limit' &&
                                  goal.spending_limit
                                    ? entry.amount > goal.spending_limit
                                      ? 'red'
                                      : 'var(--primary-1)'
                                    : entry.amount < 0
                                    ? 'var(--primary-2)'
                                    : 'var(--primary-1)'
                                }
                              />
                            )
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {currentGoal.updates &&
                JSON.parse(currentGoal.updates).length > 0 && (
                  <div className="container mx-auto p-4 ">
                    <div className="flex-1 flex flex-col justify-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8 pl-20 pr-20">
                      <h2 className="text-xl font-semibold mb-10">Updates</h2>
                      <UpdateTable
                        goal={currentGoal}
                        onUpdateGoal={handleGoalUpdate}
                      />
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      )}
      {editPopupOpen && (
        <EditGoalPopup
          togglePopup={handleEditGoalPopup}
          goal={goal}
          toggleMainPopup={onClose}
        />
      )}
      {updatePopupOpen && (
        <UpdateGoalPopup togglePopup={handleUpdateGoalPopup} goal={goal} />
      )}
    </div>
  );
};

export interface GoalsPageProps {}

export function GoalsPage() {
  const [Goals, setGoals] = useState<Goal[]>([]);
  const [isGoalPopupOpen, setIsGoalPopupOpen] = useState(false);
  const [sortOption, setSortOption] = useState('name');
  const [hasGoals, setHasGoals] = useState(false);
  const user = useContext(UserContext);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const { data, setData, refreshData } = useDataContext();

  const monthlyBudgetSpent = (goal: Goal): number => {
    if (goal.monthly_updates !== undefined) {
      const data = JSON.parse(goal.monthly_updates);
      const currentMonthYear = `${
        monthNames[new Date().getMonth()]
      } ${new Date().getFullYear()}`;
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

  const calculateProgressPercentage = (goal: Goal): number => {
    if (
      goal.current_amount !== undefined &&
      goal.initial_amount !== undefined &&
      goal.type == 'Debt Reduction'
    ) {
      if (goal.initial_amount) {
        return Math.min(
          100,
          ((goal.initial_amount - goal.current_amount) / goal.initial_amount) *
            100
        );
      } else {
        return Math.min(100, goal.current_amount * 100);
      }
    }

    if (
      goal.current_amount !== undefined &&
      goal.target_amount !== undefined &&
      goal.type == 'Savings'
    ) {
      return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
    }

    if (
      goal.spending_limit !== undefined &&
      goal.monthly_updates !== undefined &&
      goal.type == 'Spending Limit'
    ) {
      const amountForCurrentMonth = monthlyBudgetSpent(goal);
      return (amountForCurrentMonth / goal.spending_limit) * 100;
    }
    return 0;
  };

  const handleGoalUpdate = (updatedGoal: Goal) => {
    setGoals((prevGoals) =>
      prevGoals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );

    if (selectedGoal?.id === updatedGoal.id) {
      setSelectedGoal(updatedGoal);
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
  };

  const sortGoals = (goals: Goal[], option: string) => {
    return [...goals].sort((a, b) => {
      const aValue =
        option === 'name'
          ? a.name
          : option === 'type'
          ? a.type
          : option === 'end_date'
          ? new Date(a.target_date || '').getTime()
          : option === 'progress'
          ? calculateProgressPercentage(a)
          : 0;

      const bValue =
        option === 'name'
          ? b.name
          : option === 'type'
          ? b.type
          : option === 'end_date'
          ? new Date(b.target_date || '2100-01-01').getTime()
          : option === 'progress'
          ? calculateProgressPercentage(b)
          : 0;

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
  };

  const sortedGoals = sortGoals(Goals, sortOption);

  const addGoalPopup = () => {
    setIsGoalPopupOpen(!isGoalPopupOpen);
  };

  useEffect(() => {
    if (user && data.goals.length > 0) {
      setHasGoals(true);
      setGoals(data.goals);
      const updatedData = updateGoalsBasedOnTransactions();

      if (JSON.stringify(updatedData.goals) !== JSON.stringify(data.goals)) {
        updateDB(updatedData.goals);
        setData(updatedData);

        for (let i = 0; i < updatedData.goals.length; i++) {
          if (selectedGoal && updatedData.goals[i].id == selectedGoal.id) {
            setSelectedGoal(updatedData.goals[i]);
            break;
          }
        }
      }
    }
  }, [user, data.goals]);

  const updateDB = async (goals: Goal[]) => {
    for (const goal of goals) {
      const goalRef = doc(db, 'goals', goal.id);
      if (goal.updates !== undefined) {
        if (goal.type == 'Savings') {
          await updateDoc(goalRef, {
            updates: goal.updates,
            current_amount: goal.current_amount,
            monthly_updates: goal.monthly_updates,
          });
        } else if (goal.type == 'Debt Reduction' && goal.initial_amount) {
          await updateDoc(goalRef, {
            updates: goal.updates,
            current_amount: goal.initial_amount - goal.current_amount,
            monthly_updates: goal.monthly_updates,
          });
        } else {
          await updateDoc(goalRef, {
            updates: goal.updates,
            monthly_updates: goal.monthly_updates,
          });
        }
      } else {
        if (goal.type == 'Savings') {
          await updateDoc(goalRef, {
            current_amount: goal.current_amount,
          });
        } else if (goal.type == 'Debt Reduction' && goal.initial_amount) {
          await updateDoc(goalRef, {
            current_amount: goal.initial_amount - goal.current_amount,
          });
        }
      }
    }
  };

  function parseTransactionsByMonth(transaction: Transaction): any[] {
    const monthFields: (keyof Transaction)[] = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];

    let parsedTransactions: any[] = [];

    monthFields.forEach((month) => {
      if (transaction[month]) {
        const transactionsForMonth = JSON.parse(transaction[month] as string);
        transactionsForMonth.forEach((trans: any) => {
          parsedTransactions.push({
            ...trans,
            account_number: transaction.account_number,
            year: transaction.year,
          });
        });
      }
    });

    return parsedTransactions;
  }

  function matchesCondition(
    transaction: Transaction,
    condition: Condition
  ): boolean {
    const matchesAccount = condition.accounts.includes(
      transaction.account_number
    );
    const matchesKeyword =
      condition.keywords.length === 0 ||
      condition.keywords.some((keyword) =>
        transaction.description.includes(keyword)
      );
    const matchesCategory =
      condition.category === '' ||
      condition.category === transaction.category ||
      condition.category === 'Any';

    return matchesAccount && matchesKeyword && matchesCategory;
  }

  function updateGoalsBasedOnTransactions() {
    const updatedGoals = data.goals.map((goal) => {
      if (goal.update_type === 'automatic') {
        const conditions = JSON.parse(goal.conditions || '[]') as Condition[];

        const allParsedTransactions = data.transactions.flatMap(
          parseTransactionsByMonth
        );

        const filteredTransactions = allParsedTransactions.filter(
          (transaction) =>
            conditions.some((condition) =>
              matchesCondition(transaction, condition)
            )
        );
        const existingUpdates = goal.updates ? JSON.parse(goal.updates) : [];
        const deletedUpdates = goal.deleted_updates
          ? JSON.parse(goal.deleted_updates)
          : [];

        const newUpdates = filteredTransactions
          .filter(
            (transaction) =>
              !existingUpdates.some(
                (update: any) =>
                  update.date === transaction.date &&
                  update.amount ===
                    (goal.type !== 'Savings'
                      ? -transaction.amount
                      : transaction.amount)
              ) &&
              !deletedUpdates.some(
                (deleted: any) =>
                  deleted.date === transaction.date &&
                  deleted.amount ===
                    (goal.type !== 'Savings'
                      ? -transaction.amount
                      : transaction.amount)
              )
          )
          .map((transaction) => ({
            date: transaction.date,
            amount:
              goal.type !== 'Savings'
                ? -transaction.amount
                : transaction.amount,
            description: transaction.description,
            category: transaction.category,
          }));

        let updateTime = new Date().toISOString();

        if (newUpdates.length === 0) {
          updateTime = goal.last_update || updateTime;
        }

        const updatedUpdates = [...existingUpdates, ...newUpdates].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const currentAmount = updatedUpdates.reduce(
          (sum, update) => sum + update.amount,
          0
        );
        const monthlyUpdates = calculateMonthlyUpdates(updatedUpdates);
        console.log(monthlyUpdates);

        if (goal.type == 'Savings') {
          return {
            ...goal,
            updates: JSON.stringify(updatedUpdates),
            current_amount: currentAmount,
            monthly_updates: JSON.stringify(monthlyUpdates),
            last_update: updateTime,
          };
        } else if (goal.type == 'Debt Reduction' && goal.initial_amount) {
          return {
            ...goal,
            updates: JSON.stringify(updatedUpdates),
            current_amount: goal.initial_amount - currentAmount,
            monthly_updates: JSON.stringify(monthlyUpdates),
            last_update: updateTime,
          };
        } else {
          return {
            ...goal,
            updates: JSON.stringify(updatedUpdates),
            monthly_updates: JSON.stringify(monthlyUpdates),
            last_update: updateTime,
          };
        }
      } else {
        if (goal.updates) {
          const currentAmount = JSON.parse(goal.updates).reduce(
            (sum: any, update: { amount: any }) => sum + update.amount,
            0
          );
          const monthlyUpdates = calculateMonthlyUpdates(
            JSON.parse(goal.updates)
          );

          if (goal.type == 'Savings') {
            return {
              ...goal,
              current_amount: currentAmount,
              monthly_updates: JSON.stringify(monthlyUpdates),
            };
          } else if (goal.type == 'Debt Reduction' && goal.initial_amount) {
            return {
              ...goal,
              current_amount: goal.initial_amount - currentAmount,
              monthly_updates: JSON.stringify(monthlyUpdates),
            };
          } else {
            return {
              ...goal,
              monthly_updates: JSON.stringify(monthlyUpdates),
            };
          }
        }
        return goal;
      }
    });

    return {
      ...data,
      goals: updatedGoals,
    };
  }

  function calculateMonthlyUpdates(updates: any[]) {
    const monthlyTotals: { [key: string]: number } = {};

    updates.forEach((update) => {
      const date = new Date(update.date);
      const monthYear = `${date.toLocaleString('default', {
        month: 'long',
      })} ${date.getFullYear()}`;

      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = 0;
      }

      monthlyTotals[monthYear] += update.amount;
    });

    return Object.entries(monthlyTotals).map(([month, amount]) => ({
      amount,
      month,
    }));
  }

  return (
    <>
      {isGoalPopupOpen && <AddGoalPopup togglePopup={addGoalPopup} />}
      {selectedGoal && (
        <>
          <GoalInfoPage
            goal={selectedGoal}
            onClose={() => setSelectedGoal(null)}
            onUpdateGoal={handleGoalUpdate}
          ></GoalInfoPage>
        </>
      )}
      {!hasGoals && (
        <>
          <div className="flex flex-col items-center justify-center bg-[var(--main-background)] h-full">
            <div className="text-2xl">Add your first goal:</div>
            <button
              className="text-2xl mt-4 bg-BudgieBlue2 hover:bg-BudgieAccentHover transition-colors text-white p-4 rounded-2xl"
              onClick={addGoalPopup}
            >
              Add Goal
            </button>
          </div>
        </>
      )}
      {hasGoals && !isGoalPopupOpen && selectedGoal == null && (
        <>
          <div
            className="flex justify-between bg-[var(--main-background)] text-[calc(1.2rem*var(--font-size-multiplier))] mb-4 pb-4 items-end"
            style={{ borderBottom: '1px solid gray' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p className="font-bold mr-4">Sort By:</p>
              <select
                value={sortOption}
                onChange={handleSortChange}
                className={styles.sortDropdown}
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="end_date">Target Date</option>
                <option value="progress">Progress</option>
              </select>
            </div>
            <button className={styles.addAGoalButton} onClick={addGoalPopup}>
              Add a Goal
            </button>
          </div>
          <div className="w-full h-full text-[calc(1.5rem*var(--font-size-multiplier))] overflow-y-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr
                  style={{
                    color: 'var(--secondary-text)',
                    backgroundColor: 'var(--primary-1)',
                  }}
                >
                  <th className="border border-gray-200 p-2 text-left">Name</th>
                  <th className="border border-gray-200 p-2 text-left">Type</th>
                  <th className="border border-gray-200 p-2 text-left">
                    Target Date
                  </th>
                  <th className="border border-gray-200 p-2 text-left">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedGoals.map((goal, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer bg-[var(--block-background)] hover:bg-[var(--main-background)]"
                    style={{
                      fontSize: 'calc(1.2rem * var(--font-size-multiplier))',
                    }}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <td className="border border-gray-200 p-2">{goal.name}</td>
                    <td className="border border-gray-200 p-2">{goal.type}</td>
                    <td className="border border-gray-200 p-2">
                      {goal.target_date}
                    </td>
                    <td className="border border-gray-200 p-2">
                      <div className="flex items-center">
                        <div
                          className="relative w-full h-8 rounded"
                          style={{
                            backgroundColor: 'var(--main-background)',
                          }}
                        >
                          <div
                            className="absolute top-0 left-0 h-full rounded"
                            style={{
                              width:
                                goal.current_amount < 0
                                  ? 0
                                  : `${Math.min(
                                      100,
                                      calculateProgressPercentage(goal)
                                    )}%`,
                              backgroundColor: 'var(--primary-2)',
                            }}
                          />
                        </div>
                        <span
                          className="ml-3 text-sm"
                          style={{ color: 'var(--main-text' }}
                        >
                          {calculateProgressPercentage(goal).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export default GoalsPage;
