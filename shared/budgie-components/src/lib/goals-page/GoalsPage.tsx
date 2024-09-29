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
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import AddGoalPopup from '../add-goal-popup/AddGoalPopup';
import EditGoalPopup from '../edit-goal-popup/EditGoalPopup';
import styles from './GoalsPage.module.css';
import UpdateGoalPopup from '../update-goal-progress-popup/UpdateGoalProgressPopup';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import '../../root.css';

import Image from 'next/image';

import gif1 from '../../../public/images/birdgif1.gif';
import gif2 from '../../../public/images/birdgif2.gif';
import gif3 from '../../../public/images/birdgif3.gif';
import gif4 from '../../../public/images/birdgif4.gif';
import gif5 from '../../../public/images/birdgif5.gif';
import gif6 from '../../../public/images/birdgif6.gif';

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

  const handleDeleteUpdate = (amount: number, date: string) => {
    if (
      window.confirm('Do you really want to delete this update?') &&
      goal.updates
    ) {
      let updatedCurrentAmount = goal.current_amount;

      if (goal.type === 'Debt Reduction') {
        updatedCurrentAmount += amount;
      } else {
        updatedCurrentAmount -= amount;
      }

      let removed = false;
      const newUpdates: Update[] = [];
      for (let i = 0; i < localUpdates.length; i++) {
        const update = localUpdates[i];
        if (!removed && update.amount === amount && update.date === date) {
          removed = true;
          continue;
        }
        newUpdates.push(update);
      }

      goal.current_amount = updatedCurrentAmount;
      goal.updates = JSON.stringify(newUpdates);

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

      goal.monthly_updates = JSON.stringify(monthlyUpdatesArray);
      setLocalUpdates(newUpdates);
      onUpdateGoal(goal);
      updateDB();
    }
  };

  const updateDB = async () => {
    try {
      const goalData: any = {
        updates: goal.updates,
        current_amount: goal.current_amount,
        monthly_updates: goal.monthly_updates,
      };

      const goalDocRef = doc(db, 'goals', goal.id);
      await updateDoc(goalDocRef, goalData);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDeleteNonManualUpdate = (
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
      updateDBNonManual();
    }
  };

  const updateDBNonManual = async () => {
    try {
      const goalData: any = {
        updates: goal.updates,
        deleted_updates: goal.deleted_updates,
        current_amount: goal.current_amount,
        monthly_updates: goal.monthly_updates,
      };

      const goalDocRef = doc(db, 'goals', goal.id);
      await updateDoc(goalDocRef, goalData);
    } catch (error) {
      console.error('Error saving goal:', error);
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
    updateDB();
  }, [goal.updates, goal.current_amount]);

  return (
    <div style={{ fontSize: 'calc(1.2rem * var(--font-size-multiplier))' }}>
      {goal.update_type == 'manual' && (
        <div>
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr
                style={{
                  color: 'var(--secondary-text)',
                  backgroundColor: 'var(--primary-1)',
                }}
              >
                <th
                  className="border border-gray-200 p-2 text-left"
                  style={{
                    width: '1%',
                    backgroundColor: 'var(--block-background)',
                    borderLeft: '1px solid var(--block-background)',
                    borderTop: '1px solid var(--block-background)',
                    borderBottom: '1px solid var(--block-background)',
                  }}
                ></th>
                <th className="border border-gray-200 p-2 text-left">Amount</th>
                <th className="border border-gray-200 p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {localUpdates.map(
                (update: { amount: number; date: string }, index: number) => (
                  <tr key={index}>
                    <td
                      className="border border-gray-200 p-2 text-center"
                      style={{
                        width: '1%',
                        borderLeft: '1px solid var(--block-background)',
                        borderBottom: '1px solid var(--block-background)',
                      }}
                    >
                      <span
                        style={{ cursor: 'pointer', color: 'red' }}
                        onClick={() =>
                          handleDeleteUpdate(update.amount, update.date)
                        }
                      >
                        &#x2716;
                      </span>
                    </td>
                    <td className="border border-gray-200 p-2">
                      R {update.amount.toFixed(2)}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {update.date}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
      {goal.update_type != 'manual' && (
        <div>
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr
                style={{
                  color: 'var(--secondary-text)',
                  backgroundColor: 'var(--primary-1)',
                }}
              >
                <th
                  className="border border-gray-200 p-2 text-left"
                  style={{
                    width: '1%',
                    backgroundColor: 'var(--block-background)',
                    border: '1px solid var(--block-background)',
                  }}
                ></th>
                <th className="border border-gray-200 p-2 text-left">Amount</th>
                <th className="border border-gray-200 p-2 text-left">Date</th>
                <th className="border border-gray-200 p-2 text-left">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {localUpdates.map((update: Update, index: number) => (
                <tr key={index}>
                  <td
                    className="border border-gray-200 p-2 text-center"
                    style={{
                      width: '1%',
                      borderLeft: '1px solid var(--block-background)',
                      borderBottom: '1px solid var(--block-background)',
                    }}
                  >
                    <span
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() =>
                        handleDeleteNonManualUpdate(
                          update.amount,
                          update.date,
                          update.description || ''
                        )
                      }
                    >
                      &#x2716;
                    </span>
                  </td>
                  <td className="border border-gray-200 p-2">
                    R {update.amount.toFixed(2)}
                  </td>
                  <td className="border border-gray-200 p-2">{update.date}</td>
                  <td className="border border-gray-200 p-2">
                    {update.description || 'Manual Update'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
  };

  const handleEditGoalPopup = () => {
    setEditPopupOpen(!editPopupOpen);
  };

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

  const calculateSavingsGoalStatus = (goal: Goal): JSX.Element => {
    if (goal.target_date) {
      const remainingSavings = calculateRemainingSavings(goal);
      const averageSavings = calculateAverageSavings(goal);
      const monthsLeft = calculateMonthsLeft(goal.target_date);
      const requiredSavingsPerMonth = remainingSavings / monthsLeft;

      if (goal.current_amount == 0) {
        return <></>;
      } else if (requiredSavingsPerMonth > averageSavings) {
        const percentageIncrease =
          ((requiredSavingsPerMonth - averageSavings) / averageSavings) * 100;
        return (
          <p>
            Going forward, you need to save {percentageIncrease.toFixed(2)}%
            more per month than your average to reach your goal in time.
          </p>
        );
      } else {
        const percentageOfAverage =
          (requiredSavingsPerMonth / averageSavings) * 100;
        return (
          <p>
            Going forward, you only need to save{' '}
            {percentageOfAverage.toFixed(2)}% of your average savings per month
            to reach your goal in time.
          </p>
        );
      }
    }
    return <></>;
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
    <div
      className={styles.mainPage}
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100%',
        zIndex: '11',
        paddingTop: '2rem',
      }}
    >
      <div className={styles.goalPage}>
        <div className="flex flex-col gap-8">
          <div
            className="flex shadow-lg z-10 justify-center fixed top-0 right-0 z-10  bg-[var(--block-background)] p-2"
            style={{ width: '85vw' }}
          >
            <div className="container mx-auto">
              <div className="flex-1 flex flex-col justify-center text-center p-3">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: '1rem',
                  }}
                >
                  <h1
                    className="text-3xl font-bold"
                    style={{
                      color: 'var(--primary-1)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      onClick={onClose}
                      style={{
                        marginRight: '0.8rem',
                        fontSize: 'calc(1.5rem * var(--font-size-multiplier))',
                        cursor: 'pointer',
                      }}
                    >
                      arrow_back
                    </span>
                    {goal.name}
                  </h1>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div
                      className={styles.editViewButton}
                      onClick={handleEditGoalPopup}
                    >
                      Edit Details
                    </div>
                    {editPopupOpen && (
                      <EditGoalPopup
                        togglePopup={handleEditGoalPopup}
                        goal={goal}
                        toggleMainPopup={onClose}
                      />
                    )}
                    <div
                      className={styles.updateViewButton}
                      onClick={handleUpdateGoalPopup}
                    >
                      Add an Update
                    </div>
                    {updatePopupOpen && (
                      <UpdateGoalPopup
                        togglePopup={handleUpdateGoalPopup}
                        goal={goal}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[8rem]">
            <div className="container mx-auto p-4">
              <div className="flex items-stretch space-x-4">
                <div className="flex-1 flex flex-col items-center justify-between text-center bg-[var(--block-background)] rounded-lg shadow-md p-8">
                  <h2 className="text-xl font-semibold mb-4">Goal Details</h2>
                  <div
                    className="flex flex-col space-y-2 h-full justify-center"
                    style={{ width: 'auto' }}
                  >
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Goal Type:</div>
                      <div className={styles.goalValue}>{goal.type}</div>
                    </div>
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Update Type:</div>
                      <div className={styles.goalValue}>
                        {goal.update_type == 'automatic' && 'Automatic'}
                        {goal.update_type == 'manual' && 'Manual Only'}
                      </div>
                    </div>
                    {goal.initial_amount !== undefined && (
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Initial Amount:</div>
                        <div className={styles.goalValue}>
                          R {goal.initial_amount.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {goal.current_amount !== undefined &&
                      goal.type != 'Spending Limit' && (
                        <div className={styles.goalPair}>
                          <div className={styles.goalLabel}>
                            Current Amount:
                          </div>
                          <div className={styles.goalValue}>
                            R {goal.current_amount.toFixed(2)}
                          </div>
                        </div>
                      )}
                    {goal.spending_limit !== undefined &&
                      goal.type == 'Spending Limit' && (
                        <div className={styles.goalPair}>
                          <div className={styles.goalLabel}>Monthly Limit:</div>
                          <div className={styles.goalValue}>
                            R {goal.spending_limit.toFixed(2)}
                          </div>
                        </div>
                      )}
                    {goal.monthly_updates !== undefined &&
                      goal.type == 'Spending Limit' && (
                        <div className={styles.goalPair}>
                          <div className={styles.goalLabel}>
                            Spent this Month:
                          </div>
                          <div className={styles.goalValue}>
                            R {monthlyBudgetSpent(goal).toFixed(2)}
                          </div>
                        </div>
                      )}
                    {goal.target_amount !== undefined && (
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Target Amount:</div>
                        <div className={styles.goalValue}>
                          R {goal.target_amount.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {goal.target_date !== undefined && (
                      <>
                        <div className={styles.goalPair}>
                          <div className={styles.goalLabel}>Target Date:</div>
                          <div className={styles.goalValue}>
                            {goal.target_date}
                          </div>
                        </div>
                        <div className={styles.goalPair}>
                          <div className={styles.goalLabel}>Days Left:</div>
                          <div className={styles.goalValue}>
                            {calculateDaysLeft(goal.target_date) > 0
                              ? `${calculateDaysLeft(goal.target_date)} days`
                              : 'Target Date Passed'}
                          </div>
                        </div>
                      </>
                    )}
                    {goal.last_update !== undefined && (
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Last Update:</div>
                        <div className={styles.goalValue}>
                          {timeSinceLastUpdate(goal.last_update)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="flex flex-col justify-between items-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8"
                  style={{ width: '20vw' }}
                >
                  <h2 className="text-xl font-semibold mb-4">
                    {goal.type != 'Spending Limit'
                      ? 'Overall Goal Progress'
                      : 'Spent This Month'}
                  </h2>
                  <div className="relative flex-grow flex justify-center items-center h-full">
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

                {goal.type != 'Spending Limit' && (
                  <div
                    className="flex flex-col items-center justify-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8"
                    style={{ width: '20vw' }}
                  >
                    <h2 className="text-xl font-semibold mb-4">Goal Wingman</h2>
                    <div className="w-full h-full flex items-center justify-center">
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
                  {goal.target_date &&
                    calculateMonthsLeft(goal.target_date) == 0 &&
                    calculateDaysLeft(goal.target_date) == 0 && (
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
                        <p>
                          You still need to save R
                          {calculateRemainingSavings(goal).toFixed(2)}.
                        </p>
                        <br></br>
                        <p>
                          This means you need to save R
                          {calculateSavingsPerMonth(goal).toFixed(2)} per month
                          in order to reach your goal by {goal.target_date}.
                        </p>
                        <br></br>
                        <p>
                          The average amount you have saved per month is R
                          {calculateAverageSavings(goal).toFixed(2)}.
                        </p>
                        <br></br>
                        {calculateSavingsGoalStatus(goal)}
                      </>
                    )}
                  {goal.type === 'Savings' &&
                    goal.target_amount &&
                    goal.target_amount <= goal.current_amount && (
                      <p>You've reached your goal!</p>
                    )}
                  {goal.type === 'Spending Limit' && (
                    <>
                      <p>
                        On average, you have spent R
                        {calculateAverageSpending(goal).toFixed(2)} per month.
                      </p>
                      <br></br>
                      <p>
                        Your average spending is{' '}
                        {Math.abs(
                          calculateSpendingDifferencePercentage(goal)
                        ).toFixed(2)}
                        %{' '}
                        {calculateSpendingDifferencePercentage(goal) > 0
                          ? 'above'
                          : 'below'}{' '}
                        your monthly limit.
                      </p>
                      <br></br>
                      <p>
                        Your biggest expense was "
                        {calculateBiggestExpense(goal).description}" in{' '}
                        {calculateBiggestExpenseMonth(goal)}. This used{' '}
                        {calculateBiggestExpensePercentage(goal).toFixed(2)}% of
                        that month's limit.
                      </p>
                    </>
                  )}
                  {goal.type === 'Debt Reduction' &&
                    goal.target_date !== undefined &&
                    goal.current_amount > 0 &&
                    goal.target_date &&
                    calculateMonthsLeft(goal.target_date) > 0 && (
                      <>
                        <p>
                          You still need to pay R
                          {calculateRemainingDebt(goal).toFixed(2)} towards this
                          debt.
                        </p>
                        <br></br>
                        <p>
                          This means you need to pay R
                          {(
                            calculateRemainingDebt(goal) /
                            calculateMonthsLeft(goal.target_date)
                          ).toFixed(2)}{' '}
                          per month in order to reach your goal by{' '}
                          {goal.target_date}.
                        </p>
                        <br></br>
                        <p>
                          Your average monthly payment is R
                          {calculateAverageDebtPayments(goal).toFixed(2)}.
                        </p>
                      </>
                    )}
                  {goal.type === 'Debt Reduction' &&
                    goal.current_amount <= 0 && (
                      <p>You've reached your goal!</p>
                    )}
                </div>
              </div>
            </div>

            {goal.updates && JSON.parse(goal.updates).length > 0 && (
              <>
                <div className="container mx-auto p-4">
                  <div className="flex justify-between items-start gap-8">
                    <div className="flex-1 flex flex-col justify-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8 h-[40vh]">
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
                    <div className="container mx-auto p-4">
                      <div className="flex justify-between items-start gap-8">
                        <div className="flex-1 flex flex-col justify-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8 pl-20 pr-20">
                          <h2 className="text-xl font-semibold mb-10">
                            Updates
                          </h2>
                          <UpdateTable
                            goal={currentGoal}
                            onUpdateGoal={handleGoalUpdate}
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
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
  const [completedGoals, setCompletedGoals] = useState(new Set());
  const [previousProgressMap, setPreviousProgressMap] = useState<
    Record<string, number>
  >({});
  const [isLoaded, setIsLoaded] = useState(false);

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

  const calculateProgressPercentage = (goal: Goal): number => {
    if (goal.current_amount && goal.target_amount !== undefined) {
      if (goal.initial_amount) {
        return Math.min(
          100,
          ((goal.initial_amount - goal.current_amount) /
            (goal.initial_amount - goal.target_amount)) *
            100
        );
      } else {
        return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
      }
    }
    if (
      goal.spending_limit !== undefined &&
      goal.monthly_updates !== undefined
    ) {
      const amountForCurrentMonth = monthlyBudgetSpent(goal);
      return (amountForCurrentMonth / goal.spending_limit) * 100;
    }
    return 0;
  };

  const sendGoalProgressEmail = async (progress: number) => {
    const user = getAuth().currentUser;
    console.log(user?.uid, user?.email, user?.displayName, '', progress);
    try {
      await axios.post(
        'https://us-central1-budgieapp-70251.cloudfunctions.net/sendGoalProgressEmail',
        {
          uid: user?.uid,
          userEmail: user?.email,
          userName: user?.displayName,
          title: '',
          progress,
        }
      );
      console.log(`Email sent for ${progress}% progress.`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  useEffect(() => {
    const populateAndProcessGoals = async () => {
      const storedProgressMap = localStorage.getItem('previousProgressMap');
      let progressMap = {};

      if (storedProgressMap) {
        progressMap = JSON.parse(storedProgressMap);
        if (
          JSON.stringify(progressMap) !== JSON.stringify(previousProgressMap)
        ) {
          setPreviousProgressMap(progressMap);
        }
      }
      const isGoalEnabled = localStorage.getItem('goal') === 'true';
      if (isGoalEnabled && Goals.length > 0) {
        const updatedMap = { ...progressMap };

        Goals.forEach((goal) => {
          const progress = calculateProgressPercentage(goal);
          console.log('previous: ' + previousProgressMap[goal.id]);
          console.log('progress: ' + progress);
          console.log('goal id: ' + goal.id);
          const previousProgress = updatedMap[goal.id] || 0;

          if (
            progress >= 100 &&
            previousProgress < 100 &&
            progress != previousProgress
          ) {
            sendGoalProgressEmail(100);
          } else if (
            progress >= 75 &&
            previousProgress < 75 &&
            progress < 100 &&
            progress != previousProgress
          ) {
            sendGoalProgressEmail(75);
          } else if (
            progress >= 50 &&
            previousProgress < 50 &&
            progress < 75 &&
            progress != previousProgress
          ) {
            sendGoalProgressEmail(50);
          }
          updatedMap[goal.id] = progress;
        });

        if (
          JSON.stringify(updatedMap) !== JSON.stringify(previousProgressMap)
        ) {
          setPreviousProgressMap(updatedMap);
          localStorage.setItem(
            'previousProgressMap',
            JSON.stringify(updatedMap)
          );
        }
      }
    };
    if (Goals.length > 0) {
      populateAndProcessGoals();
    }
  }, [Goals, previousProgressMap]);

  const updateGoalTransactions = async (goal: Goal) => {
    try {
      const existingUpdates = goal.updates ? JSON.parse(goal.updates) : [];

      let updatedCurrentAmount = 0;
      existingUpdates.forEach((tx: any) => {
        if (goal.type === 'Debt Reduction') {
          updatedCurrentAmount -= tx.amount;
        } else {
          updatedCurrentAmount += tx.amount;
        }
      });

      goal.current_amount = updatedCurrentAmount;
      await updateDoc(doc(db, 'goals', goal.id), {
        current_amount: updatedCurrentAmount,
      });

      handleGoalUpdate(goal);
    } catch (error) {
      console.error('Error updating goal transactions:', error);
    }
  };

  const fetchGoals = async () => {
    if (user && user.uid) {
      try {
        const goalsCollection = collection(db, 'goals');
        const goalsQuery = query(goalsCollection, where('uid', '==', user.uid));
        const goalsSnapshot = await getDocs(goalsQuery);
        const goalsList = goalsSnapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Goal, 'id'>;
          return {
            id: doc.id,
            ...data,
          };
        });

        if (goalsList.length > 0) {
          setHasGoals(true);
        }

        const sortedGoals = sortGoals(goalsList, sortOption);
        setGoals(sortedGoals);

        const initialProgressMap = sortedGoals.reduce((acc, goal) => {
          acc[goal.id] = 0;
          return acc;
        }, {} as Record<string, number>);
        setPreviousProgressMap(initialProgressMap);

        for (let goal of sortedGoals) {
          await updateGoalTransactions(goal);
        }

        const automaticGoals = sortedGoals.filter(
          (goal) => goal.update_type === 'automatic'
        );
        automaticGoals.forEach(async (goal) => {
          await updateTransactionsForGoal(goal);
          handleGoalUpdate(goal);
        });
      } catch (error) {
        console.error('Error getting goals document:', error);
      }
    }
  };

  const addGoalPopup = () => {
    setIsGoalPopupOpen(!isGoalPopupOpen);
    fetchGoals();
  };

  useEffect(() => {
    if (!selectedGoal) {
      fetchGoals();
    }
  }, [sortOption, selectedGoal]);

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

  const sortedGoals = sortGoals(Goals, sortOption);

  const handleNameClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const getAccountNumbersForCondition = async (
    aliases: string[]
  ): Promise<string[]> => {
    const accountNumbers: string[] = [];
    if (user && user.uid && aliases.length > 0) {
      try {
        const accountsCollectionRef = collection(db, 'accounts');
        const batchSize = 10;
        for (let i = 0; i < aliases.length; i += batchSize) {
          const batch = aliases.slice(i, i + batchSize);
          const q = query(
            accountsCollectionRef,
            where('uid', '==', user.uid),
            where('alias', 'in', batch)
          );
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.account_number) {
              accountNumbers.push(data.account_number);
            }
          });
        }
      } catch (error) {
        console.error('Error getting account numbers for condition:', error);
      }
    }
    return accountNumbers;
  };

  const getTransactionsForAccounts = async (
    accountNumbers: string[],
    goal: Goal
  ): Promise<any[]> => {
    if (user && user.uid) {
      let transactionsList: any[] = [];
      const currentYear = new Date().getFullYear();
      const years = [];

      for (let year = 1980; year <= currentYear; year++) {
        years.push(`transaction_data_${year}`);
      }

      try {
        for (let year of years) {
          for (let accountNumber of accountNumbers) {
            const q = query(
              collection(db, year),
              where('account_number', '==', accountNumber),
              where('uid', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
              const docData = doc.data();
              const months = [
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

              let negation = -1;
              if (goal.type == 'Savings') {
                negation = 1;
              }

              months.forEach((month) => {
                if (docData[month]) {
                  const transactions = JSON.parse(docData[month]);
                  transactionsList = transactionsList.concat(
                    transactions.map((transaction: { amount: number }) => ({
                      ...transaction,
                      amount: transaction.amount * negation,
                    }))
                  );
                }
              });
            });
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }

      return transactionsList;
    }
    return [];
  };

  const filterTransactionsByCategory = (
    transactions: any[],
    category: string
  ): any[] => {
    if (!category || category === 'Any') {
      return transactions;
    }

    return transactions.filter(
      (transaction: { category: string }) => transaction.category === category
    );
  };

  const filterTransactionsByKeywords = (
    transactions: any[],
    keywords: string[]
  ): any[] => {
    const matchingTransactions: any[] = [];
    const remainingTransactions = [...transactions];

    keywords.forEach((keyword) => {
      for (let i = remainingTransactions.length - 1; i >= 0; i--) {
        const transaction = remainingTransactions[i];
        if (
          transaction.description.toLowerCase().includes(keyword.toLowerCase())
        ) {
          matchingTransactions.push(transaction);
          remainingTransactions.splice(i, 1);
        }
      }
    });

    if (keywords.length === 0) {
      return remainingTransactions;
    }

    return matchingTransactions;
  };

  const updateTransactionsForGoal = async (goal: Goal) => {
    try {
      const conditions = goal.conditions ? JSON.parse(goal.conditions) : [];
      let allMatchingTransactions: any[] = [];

      for (let condition of conditions) {
        const { accounts, category, keywords } = condition;
        const conditionAccountNumbers = await getAccountNumbersForCondition(
          accounts
        );
        let transactionsForCondition = await getTransactionsForAccounts(
          conditionAccountNumbers,
          goal
        );
        transactionsForCondition = filterTransactionsByCategory(
          transactionsForCondition,
          category
        );
        const keywordFilteredTransactions = filterTransactionsByKeywords(
          transactionsForCondition,
          keywords || []
        );
        allMatchingTransactions = allMatchingTransactions.concat(
          keywordFilteredTransactions
        );
      }

      if (allMatchingTransactions.length > 0) {
        const existingUpdates = goal.updates ? JSON.parse(goal.updates) : [];
        const deletedUpdates = goal.deleted_updates
          ? JSON.parse(goal.deleted_updates)
          : [];
        const filteredTransactions = allMatchingTransactions.filter((newTx) => {
          return !deletedUpdates.some(
            (deletedTx: any) =>
              deletedTx.amount === newTx.amount &&
              deletedTx.date === newTx.date &&
              deletedTx.description === newTx.description &&
              deletedTx.category === newTx.category
          );
        });
        const newTransactions = filteredTransactions.filter((newTx) => {
          return !existingUpdates.some(
            (existingTx: any) =>
              existingTx.amount === newTx.amount &&
              existingTx.date === newTx.date &&
              existingTx.description === newTx.description &&
              existingTx.category === newTx.category
          );
        });

        if (newTransactions.length > 0) {
          for (let i = 0; i < newTransactions.length; i++) {
            if (goal.type !== 'Debt Reduction') {
              goal.current_amount += newTransactions[i].amount;
            } else {
              goal.current_amount -= newTransactions[i].amount;
            }
          }
          goal.updates = JSON.stringify([
            ...existingUpdates,
            ...newTransactions,
          ]);
          const monthlyUpdates = aggregateMonthlyUpdates([
            ...existingUpdates,
            ...newTransactions,
          ]);
          goal.monthly_updates = JSON.stringify(monthlyUpdates);
          goal.last_update = new Date().toISOString();

          await updateGoalInDB(goal);
        }
      }
    } catch (error) {
      console.error('Error updating transactions for goal:', error);
    }
  };

  const aggregateMonthlyUpdates = (
    transactions: any[]
  ): { amount: number; month: string }[] => {
    const monthlySums: { [key: string]: number } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (!monthlySums[monthYear]) {
        monthlySums[monthYear] = 0;
      }

      monthlySums[monthYear] += transaction.amount;
    });

    return Object.entries(monthlySums).map(([month, amount]) => ({
      amount: parseFloat(amount.toFixed(2)),
      month,
    }));
  };

  const updateGoalInDB = async (goal: Goal) => {
    try {
      const goalDocRef = doc(db, 'goals', goal.id);
      await updateDoc(goalDocRef, {
        updates: goal.updates,
        current_amount: goal.current_amount,
        monthly_updates: goal.monthly_updates,
        last_update: goal.last_update,
      });
    } catch (error) {
      console.error('Error updating goal in Firestore:', error);
    }
  };

  return (
    <>
      {isGoalPopupOpen && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            zIndex: 100,
          }}
        >
          <AddGoalPopup togglePopup={addGoalPopup} />
        </div>
      )}
      {selectedGoal && (
        <div style={{ position: 'relative' }} className="relative">
          <GoalInfoPage
            goal={selectedGoal}
            onClose={() => setSelectedGoal(null)}
            onUpdateGoal={handleGoalUpdate}
          ></GoalInfoPage>
        </div>
      )}
      {!hasGoals ? (
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
      ) : (
        <div style={{ position: 'relative' }} className="relative">
          <div className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p className={styles.sortHeader}>Sort By:</p>
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
          <div className={styles.planningModalContainer}>
            <div className="p-4">
              <table className="min-w-full table-auto border-collapse border border-gray-200">
                <thead>
                  <tr
                    style={{
                      color: 'var(--secondary-text)',
                      backgroundColor: 'var(--primary-1)',
                    }}
                  >
                    <th className="border border-gray-200 p-2 text-left">
                      Name
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Type
                    </th>
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
                      style={{
                        backgroundColor: 'var(--block-background)',
                        fontSize: 'calc(1.2rem * var(--font-size-multiplier))',
                      }}
                    >
                      <td
                        className="border p-2 underline cursor-pointer hover:text-blue-700"
                        onClick={() => handleNameClick(goal)}
                      >
                        {goal.name}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {goal.type}
                      </td>
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
                              className="absolute top-0 left-0 h-full bg-green-500 rounded"
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
          </div>
        </div>
      )}
    </>
  );
}

export default GoalsPage;
