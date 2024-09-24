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
} from 'recharts';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
  current_amount?: number;
  target_amount?: number;
  target_date?: string;
  spending_limit?: number;
  updates?: string;
  monthly_updates?: string;
  update_type: string;
  accounts: ([]);
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

export interface GraphCarouselProps {
  goal: Goal;
}

const GraphCarousel = ({ goal }: GraphCarouselProps) => {
  const slides = ['Slide 1', 'Slide 2', 'Slide 3'];
  const [currentIndex, setCurrentIndex] = useState(0);

  interface GoalUpdate {
    amount: number;
    date: string;
  }

  interface GoalMonthlyUpdate {
    amount: number;
    month: string;
  }

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
    if (goal.current_amount && goal.initial_amount !== undefined) {
      return Math.min(
        100,
        ((goal.initial_amount - goal.current_amount) / (goal.initial_amount)) * 100
      );
    }
    if (
      goal.spending_limit !== undefined &&
      goal.monthly_updates !== undefined
    ) {
      const amountForCurrentMonth = monthlyBudgetSpent(now.getMonth());
      return (amountForCurrentMonth / goal.spending_limit) * 100;
    }
    return 0;
  };

  const monthlyBudgetSpent = (month: number): number => {
    if (goal.monthly_updates !== undefined) {
      const data = JSON.parse(goal.monthly_updates);
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

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 2 - 1 ? 0 : prevIndex + 1));
  };

  const getUpdates = () => {
    if (goal.monthly_updates) {
      const updatesData: GoalMonthlyUpdate[] = JSON.parse(goal.monthly_updates);

      const parseMonth = (monthStr: string): Date => {
        return new Date(`1 ${monthStr}`);
      };

      const formattedData = updatesData
        .map((update) => ({
          month: update.month,
          amount: update.amount,
          date: parseMonth(update.month),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(({ date, ...rest }) => rest);
      return formattedData;
    }
  };

  const getBudgetUpdates = () => {
    if (goal.monthly_updates) {
      const updatesData: GoalMonthlyUpdate[] = JSON.parse(goal.monthly_updates);

      const parseMonth = (monthStr: string): Date => {
        return new Date(`1 ${monthStr}`);
      };

      const spendingLimit = goal.spending_limit || Infinity;

      const formattedData = updatesData
        .map((update) => {
          const amount = update.amount;
          const excess = amount > spendingLimit ? amount - spendingLimit : 0;
          const amountWithinLimit =
            amount > spendingLimit ? spendingLimit : amount;

          return {
            month: update.month,
            amount: amountWithinLimit,
            excess,
            date: parseMonth(update.month),
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(({ date, excess, ...rest }) => ({
          ...rest,
          excess,
        }));

      return formattedData;
    }
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const currentMonthName = monthNames[currentMonthIndex];

  const getColorForValue = (value: number): string => {
    if (value < 100) return 'var(--primary-1)';
    return '#FF0000';
  };

  return (
    <div className={styles.carousel}>
      <div
        className={styles.carouselContainer}
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'none',
        }}
      >
        {goal.type === 'Savings' && (
          <div className={styles.carouselSlide} key="progress">
            <div className={styles.goalGraph}>
              <CircularProgressbar
                value={calculateProgressPercentage(goal)}
                styles={buildStyles({
                  pathColor: 'var(--primary-1)',
                  trailColor: '#d6d6d6',
                })}
              />
              <div className={styles.percentageDisplay}>
                {`${calculateProgressPercentage(goal).toFixed(2)}%`}
              </div>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={prevSlide}>
                  &#8592;
                </span>
              ) : (
                <span></span>
              )}
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Goal Progress
              </span>
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={nextSlide}>
                  &#8594;
                </span>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        )}

        {goal.type === 'Savings' && goal.updates !== undefined && (
          <div className={styles.carouselSlide} key="chart">
            <div className={styles.goalGraph}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getUpdates()}
                  margin={{ top: 0, right: 0, bottom: 0, left: 10 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={false}
                    stroke="var(--main-text)"
                  />
                  <YAxis
                    tick={{ fill: 'var(--main-text)' }}
                    stroke="var(--main-text)"
                  >
                    <Label
                      value="Amount"
                      angle={-90}
                      position="left"
                      style={{ textAnchor: 'middle', fill: 'var(--main-text)' }}
                    />
                  </YAxis>
                  <Tooltip cursor={{ fill: 'var(--main-background)' }} />
                  <Bar dataKey="amount" fill="var(--primary-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span className={styles.arrow} onClick={prevSlide}>
                &#8592;
              </span>
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Savings per Month
              </span>
              <span className={styles.arrow} onClick={nextSlide}>
                &#8594;
              </span>
            </div>
          </div>
        )}

        {goal.type === 'Debt Reduction' && (
          <div className={styles.carouselSlide} key="progress">
            <div className={styles.goalGraph}>
              <CircularProgressbar
                value={calculateProgressPercentage(goal)}
                styles={buildStyles({
                  pathColor: 'var(--primary-1)',
                  trailColor: '#d6d6d6',
                })}
              />
              <div className={styles.percentageDisplay}>
                {`${calculateProgressPercentage(goal).toFixed(2)}%`}
              </div>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={prevSlide}>
                  &#8592;
                </span>
              ) : (
                <span></span>
              )}
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Goal Progress
              </span>
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={nextSlide}>
                  &#8594;
                </span>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        )}

        {goal.type === 'Debt Reduction' && goal.updates !== undefined && (
          <div className={styles.carouselSlide} key="chart">
            <div className={styles.goalGraph}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getUpdates()}
                  margin={{ top: 0, right: 0, bottom: 0, left: 10 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={false}
                    stroke="var(--main-text)"
                  />
                  <YAxis
                    tick={{ fill: 'var(--main-text)' }}
                    stroke="var(--main-text)"
                  >
                    <Label
                      value="Amount"
                      angle={-90}
                      position="left"
                      style={{ textAnchor: 'middle', fill: 'var(--main-text)' }}
                    />
                  </YAxis>
                  <Tooltip cursor={{ fill: 'var(--main-background)' }} />
                  <Bar dataKey="amount" fill="var(--primary-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span className={styles.arrow} onClick={prevSlide}>
                &#8592;
              </span>
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Debt Payments per Month
              </span>
              <span className={styles.arrow} onClick={nextSlide}>
                &#8594;
              </span>
            </div>
          </div>
        )}

        {goal.type === 'Spending Limit' && (
          <div className={styles.carouselSlide} key="progress">
            <div className={styles.goalGraph}>
              <CircularProgressbar
                value={calculateProgressPercentage(goal)}
                styles={buildStyles({
                  pathColor: getColorForValue(
                    calculateProgressPercentage(goal)
                  ),
                  trailColor: '#d6d6d6',
                })}
              />
              <div
                className={styles.percentageDisplay}
                style={{
                  color: getColorForValue(calculateProgressPercentage(goal)),
                }}
              >
                {`${calculateProgressPercentage(goal).toFixed(2)}%`}
              </div>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={prevSlide}>
                  &#8592;
                </span>
              ) : (
                <span></span>
              )}
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Budget Used for {currentMonthName} {currentYear}
              </span>
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={nextSlide}>
                  &#8594;
                </span>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        )}

        {goal.type === 'Spending Limit' && goal.updates !== undefined && (
          <div className={styles.carouselSlide} key="chart">
            <div className={styles.goalGraph}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getBudgetUpdates()}
                  margin={{ top: 0, right: 0, bottom: 0, left: 10 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={false}
                    stroke="var(--main-text)"
                  />
                  <YAxis
                    tick={{ fill: 'var(--main-text)' }}
                    stroke="var(--main-text)"
                  >
                    <Label
                      value="Amount"
                      angle={-90}
                      position="left"
                      style={{ textAnchor: 'middle', fill: 'var(--main-text)' }}
                    />
                  </YAxis>
                  <Tooltip cursor={{ fill: 'var(--main-background)' }} />
                  <Bar dataKey="amount" stackId="a" fill="var(--primary-1)" />
                  <Bar dataKey="excess" stackId="a" fill="red" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span className={styles.arrow} onClick={prevSlide}>
                &#8592;
              </span>
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Amount Spent per Month
              </span>
              <span className={styles.arrow} onClick={nextSlide}>
                &#8594;
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export interface GoalInfoPageProps {
  goal: Goal;
  onClose: () => void;
}

const GoalInfoPage = ({ goal, onClose }: GoalInfoPageProps) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const currentMonthName = monthNames[currentMonthIndex];

  const [updatePopupOpen, setUpdatePopupOpen] = useState(false);

  const handleUpdateGoalPopup = () => {
    setUpdatePopupOpen(!updatePopupOpen);
  };

  const [editPopupOpen, setEditPopupOpen] = useState(false);

  const handleEditGoalPopup = () => {
    setEditPopupOpen(!editPopupOpen);
  };


  const monthlyBudgetSpent = (goal: Goal): number => {
    if (goal.monthly_updates !== undefined) {
      const data = JSON.parse(goal.monthly_updates);
      const currentMonthYear = `${monthNames[new Date().getMonth()]
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

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Progress',
        data: [10, 20, 30, 40, 50, 60],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const getColorForValue = (value: number, type: string): string => {
    if (value < 100) return 'var(--primary-1)';
    if (type == 'Spending Limit' && value >= 100) return '#FF0000';
    return '#46981d';
  };

  interface GoalMonthlyUpdate {
    amount: number;
    month: string;
  }

  const getUpdates = () => {
    if (goal.monthly_updates) {
      const updatesData: GoalMonthlyUpdate[] = JSON.parse(goal.monthly_updates);

      const parseMonth = (monthStr: string): Date => {
        return new Date(`1 ${monthStr}`);
      };

      const formattedData = updatesData
        .map((update) => ({
          month: update.month,
          amount: update.amount,
          date: parseMonth(update.month),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(({ date, ...rest }) => rest);
      return formattedData;
    }
  };

  const getBudgetUpdates = () => {
    if (goal.monthly_updates) {
      const updatesData: GoalMonthlyUpdate[] = JSON.parse(goal.monthly_updates);

      const parseMonth = (monthStr: string): Date => {
        return new Date(`1 ${monthStr}`);
      };

      const spendingLimit = goal.spending_limit || Infinity;

      const formattedData = updatesData
        .map((update) => {
          const amount = update.amount;
          const excess = amount > spendingLimit ? amount - spendingLimit : 0;
          const amountWithinLimit =
            amount > spendingLimit ? spendingLimit : amount;

          return {
            month: update.month,
            amount: amountWithinLimit,
            excess,
            date: parseMonth(update.month),
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(({ date, excess, ...rest }) => ({
          ...rest,
          excess,
        }));

      return formattedData;
    }
  };

  return (
    <div className={styles.mainPage} style={{ position: 'fixed', right: 0, top: 0, height: '100%', zIndex: "11", paddingTop: '2rem' }}>
      <div className={styles.goalPage}>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--primary-1)' }}>
          <span className="material-symbols-outlined" onClick={onClose} style={{ marginRight: '0.8rem', fontSize: 'calc(1.5rem * var(--font-size-multiplier))' }}>
            arrow_back
          </span>
          {goal.name}
        </h1>
        <div className={styles.goalPageRow} style={{ display: 'flex', justifyContent: 'space-between' }}>

          {goal.type != 'Spending Limit' && (
            <>
            <div className={styles.goalPageBlock} style={{ width: 'calc(100% - 20rem)', display: 'flex', flexDirection: 'column', margin: '1rem' }}>
            <h2 className="text-xl font-semibold mb-4">Goal Details</h2>
            <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center' }}>
              <div className="flex justify-around items-center">
                <div className="flex flex-col space-y-2">
                  <div className={styles.goalPair}>
                    <div className={styles.goalLabel}>Goal Type:</div>
                    <div className={styles.goalValue}>{goal.type}</div>
                  </div>
                  {goal.update_type != undefined && (
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Update Type:</div>
                      {goal.update_type == 'assign-all' && (
                        <div className={styles.goalValue}>Assigned Account/s</div>
                      )}
                      {goal.update_type == 'assign-description' && (
                        <div className={styles.goalValue}>By Transaction Descriptions</div>
                      )}
                      {goal.update_type == 'assign-transactions' && (
                        <div className={styles.goalValue}>Manual Transaction Assignment</div>
                      )}
                      {goal.update_type == 'assign-category' && (
                        <div className={styles.goalValue}>By Transaction Category</div>
                      )}
                      {goal.update_type == 'manual' && (
                        <div className={styles.goalValue}>Manual Updates</div>
                      )}
                    </div>
                  )}
                  {goal.target_date != undefined && (
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Target Date:</div>
                      <div className={styles.goalValue}>{goal.target_date}</div>
                    </div>
                  )}
                  {goal.initial_amount != undefined && (
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Initial Amount:</div>
                      <div className={styles.goalValue}>R {goal.initial_amount.toFixed(2)}</div>
                    </div>
                  )}
                  {goal.current_amount != undefined && (
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Current Amount:</div>
                      <div className={styles.goalValue}>R {goal.current_amount.toFixed(2)}</div>
                    </div>
                  )}
                  {goal.target_amount != undefined &&
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Target Amount:</div>
                      <div className={styles.goalValue}>R {goal.target_amount.toFixed(2)}</div>
                    </div>
                  }
                  {goal.target_date != undefined &&
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>
                        Days Left:
                      </div>
                      <div className={styles.goalValue}>
                        {calculateDaysLeft(goal.target_date) > 0
                          ? ` ${calculateDaysLeft(
                            goal.target_date
                          )}`
                          : 'Target Date Passed'}
                      </div>
                    </div>
                  }
                </div>

                {/* Buttons */}
                <div className="flex flex-col space-y-4">
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
                  {goal.update_type == 'manual' && (
                    <>
                      <div
                        className={styles.updateViewButton}
                        onClick={handleUpdateGoalPopup}
                      >
                        Update Progress
                      </div>
                      {updatePopupOpen && (
                        <UpdateGoalPopup
                          togglePopup={handleUpdateGoalPopup}
                          goal={goal}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
            <div
              className={styles.goalPageBlock}
              style={{
                width: '25rem',
                backgroundColor: 'var(--block-background)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                margin: '1rem'
              }}
            >
              <h2 className="text-xl font-semibold mb-4">Goal Wingman</h2>
              <div className="flex items-center justify-center w-full h-full">
                <Image src={getGif(calculateProgressPercentage(goal))} alt="Goal GIF" className="object-contain w-full h-full" />
              </div>
            </div>
            </>)}

            {goal.type == 'Spending Limit' && (
            <>
            <div className={styles.goalPageBlock} style={{ width: '100%', display: 'flex', flexDirection: 'column', margin: '1rem' }}>
            <h2 className="text-xl font-semibold mb-4">Goal Details</h2>
            <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center' }}>
              <div className="flex justify-around items-center">
                <div className="flex flex-col space-y-2">
                  <div className={styles.goalPair}>
                    <div className={styles.goalLabel}>Goal Type:</div>
                    <div className={styles.goalValue}>{goal.type}</div>
                  </div>
                  {goal.update_type != undefined && (
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Update Type:</div>
                      {goal.update_type == 'assign-all' && (
                        <div className={styles.goalValue}>Assigned Account/s</div>
                      )}
                      {goal.update_type == 'assign-description' && (
                        <div className={styles.goalValue}>By Transaction Descriptions</div>
                      )}
                      {goal.update_type == 'assign-transactions' && (
                        <div className={styles.goalValue}>Manual Transaction Assignment</div>
                      )}
                      {goal.update_type == 'assign-category' && (
                        <div className={styles.goalValue}>By Transaction Category</div>
                      )}
                      {goal.update_type == 'manual' && (
                        <div className={styles.goalValue}>Manual Updates</div>
                      )}
                    </div>
                  )}
                  {goal.target_date != undefined && (
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Target Date:</div>
                      <div className={styles.goalValue}>{goal.target_date}</div>
                    </div>
                  )}
                  {goal.initial_amount != undefined && (
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Initial Amount:</div>
                      <div className={styles.goalValue}>R {goal.initial_amount.toFixed(2)}</div>
                    </div>
                  )}
                  {goal.current_amount != undefined && (
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Current Amount:</div>
                      <div className={styles.goalValue}>R {goal.current_amount.toFixed(2)}</div>
                    </div>
                  )}
                  {goal.target_amount != undefined &&
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Target Amount:</div>
                      <div className={styles.goalValue}>R {goal.target_amount.toFixed(2)}</div>
                    </div>
                  }
                  {goal.target_date != undefined &&
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>
                        Days Left:
                      </div>
                      <div className={styles.goalValue}>
                        {calculateDaysLeft(goal.target_date) > 0
                          ? ` ${calculateDaysLeft(
                            goal.target_date
                          )}`
                          : 'Target Date Passed'}
                      </div>
                    </div>
                  }
                </div>

                {/* Buttons */}
                <div className="flex flex-col space-y-4">
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
                  {goal.update_type == 'manual' && (
                    <>
                      <div
                        className={styles.updateViewButton}
                        onClick={handleUpdateGoalPopup}
                      >
                        Update Progress
                      </div>
                      {updatePopupOpen && (
                        <UpdateGoalPopup
                          togglePopup={handleUpdateGoalPopup}
                          goal={goal}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-4"></h2>
          </div>
            
            </>)}
        </div>


        <div className={styles.goalPageRow} style={{ display: 'flex', gap: '2rem' }}>
          {/* Row 2 - Left Block (Progress Circle) */}
          <div className={styles.goalPageBlock} style={{ flex: 1, margin: '1rem 0 1rem 1rem' }}>
            <h2 className="text-xl font-semibold mb-4">Overall Goal Progress</h2>
            <div className="flex items-center justify-center">
              <div className={styles.goalGraph}>
                <CircularProgressbar
                  value={calculateProgressPercentage(goal)}
                  styles={buildStyles({
                    pathColor: getColorForValue(
                      calculateProgressPercentage(goal), goal.type
                    ),
                    trailColor: '#d6d6d6',
                  })}
                />
                <div
                  className={styles.percentageDisplay}
                  style={{
                    color: getColorForValue(calculateProgressPercentage(goal), goal.type),
                  }}
                >
                  {`${calculateProgressPercentage(goal).toFixed(2)}%`}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 - Right Block (Bar Chart) 
          <div className={styles.goalPageBlock} style={{ flex: 1, margin: '1rem 1rem 1rem 0' }}>
            <h2 className="text-xl font-semibold mb-4">Goal Progress Over Time</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getUpdates()}
                margin={{ top: 0, right: 0, bottom: 0, left: 10 }}
              >
                <XAxis
                  dataKey="month"
                  tick={false}
                  stroke="var(--main-text)"
                />
                <YAxis
                  tick={{ fill: 'var(--main-text)' }}
                  stroke="var(--main-text)"
                >
                  <Label
                    value="Amount"
                    angle={-90}
                    position="left"
                    style={{ textAnchor: 'middle', fill: 'var(--main-text)' }}
                  />
                </YAxis>
                <Tooltip cursor={{ fill: 'var(--main-background)' }} />
                <Bar dataKey="amount" fill="var(--primary-1)" />
              </BarChart>
            </ResponsiveContainer>
          </div>*/}
        </div>


        {/* Row 3 - Full Width (Transactions) */}
        <div className={styles.goalPageBlock} style={{ margin: '1rem' }}>
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          {/* Add your transactions table or content here */}
          <p>Transaction list goes here...</p>
        </div>
      </div>
    </div>
  );
};







export interface GoalsPageProps { }

export function GoalsPage() {
  const [Goals, setGoals] = useState<Goal[]>([]);
  const [isGoalPopupOpen, setIsGoalPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [updatePopupOpen, setUpdatePopupOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [sortOption, setSortOption] = useState('name');
  const [hasGoals, setHasGoals] = useState(false);
  const user = useContext(UserContext);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);


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

      // Compare values
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

  const calculateDaysLeft = (targetDate: string): number => {
    const currentDate = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
        setGoals(sortGoals(goalsList, sortOption));
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
    fetchGoals();
  }, [sortOption, selectedGoal]);

  const handleEditGoalPopup = (index: number) => {
    setEditPopupOpen((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
    fetchGoals();
  };

  const handleUpdateGoalPopup = (index: number) => {
    setUpdatePopupOpen((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
    fetchGoals();
  };

  const monthlyBudgetSpent = (goal: Goal): number => {
    if (goal.monthly_updates !== undefined) {
      const data = JSON.parse(goal.monthly_updates);
      const currentMonthYear = `${monthNames[new Date().getMonth()]
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

  return (
    <div className={styles.mainPage}>
      {!hasGoals ? (
        <>
          <div className={styles.noGoalScreen}>
            <div className={styles.noGoalText}>Add your first goal:</div>
            <button className={styles.addGoalsButton} onClick={addGoalPopup}>
              Add a Goal
            </button>
            {isGoalPopupOpen && <AddGoalPopup togglePopup={addGoalPopup} />}
          </div>
        </>
      ) : (
        <>
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
            {isGoalPopupOpen && <AddGoalPopup togglePopup={addGoalPopup} />}
          </div>
          <div
            style={{
              width: '85vw',
              backgroundColor: 'var(--main-background)',
              marginBottom: 'calc((4rem * var(--font-size-multiplier)))',
            }}
          ></div>
          <div className={styles.planningModalContainer}>

            <div className="p-4">
              <table className="min-w-full table-auto border-collapse border border-gray-200">
                <thead>
                  <tr style={{ color: 'var(--secondary-text)', backgroundColor: 'var(--primary-1)' }}>
                    <th className="border border-gray-200 p-2 text-left">Name</th>
                    <th className="border border-gray-200 p-2 text-left">Type</th>
                    <th className="border border-gray-200 p-2 text-left">Target Date</th>
                    <th className="border border-gray-200 p-2 text-left">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGoals.map((goal, index) => (
                    <tr key={index}
                      style={{ backgroundColor: 'var(--block-background)', fontSize: "calc(1.2rem * var(--font-size-multiplier))" }}>
                      <td className="border p-2 underline cursor-pointer hover:text-blue-700"
                        onClick={() => handleNameClick(goal)}>{goal.name}</td>
                      <td className="border border-gray-200 p-2">{goal.type}</td>
                      <td className="border border-gray-200 p-2">
                        {goal.target_date}
                      </td>
                      <td className="border border-gray-200 p-2">
                        <div className="flex items-center">
                          <div className="relative w-full h-8 rounded" style={{ backgroundColor: 'var(--main-background)' }}>
                            <div
                              className="absolute top-0 left-0 h-full bg-green-500 rounded"
                              style={{
                                width: `${calculateProgressPercentage(goal)}%`,
                                backgroundColor: 'var(--primary-2)',
                              }}
                            />

                          </div>
                          <span className="ml-3 text-sm" style={{ color: 'var(--main-text' }}>
                            {calculateProgressPercentage(goal)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedGoal && (


              <>
                <GoalInfoPage goal={selectedGoal} onClose={() => setSelectedGoal(null)}></GoalInfoPage>
                {/*<h2 className="text-xl font-bold">Goal Details</h2>
    <p>Name: {selectedGoal.name}</p>
    <p>Type: {selectedGoal.type}</p>
    {selectedGoal.target_date && <p>Target Date: {selectedGoal.target_date}</p>}
    <p>Progress: {calculateProgressPercentage(selectedGoal)}%</p>


    <button
      onClick={() => setSelectedGoal(null)} // Close the component
      className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-700"
    >
      Close
    </button>*/}
              </>
            )}




            {/*Goals ? (
              <>
                {Goals.map((goal, index) => (
                  <div key={goal.id || index}>
                    <div className={styles.planningModalTitle}>
                      {goal.name}
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize:
                            'min(2.5rem, (calc(1.5rem * var(--font-size-multiplier))))',
                          fontWeight: 500,
                          color: 'var(--primary-text)',
                          marginLeft: '1rem',
                        }}
                        onClick={() => handleEditGoalPopup(index)}
                      >
                        edit
                      </span>
                      {editPopupOpen[index] && (
                        <EditGoalPopup
                          togglePopup={() => handleEditGoalPopup(index)}
                          goal={goal}
                        />
                      )}
                    </div>
                    <div className={styles.planningModal}>
                      <div className={styles.goalsContainer}>
                        <div className={styles.goalDisplay}>
                          <div className={styles.goal}>
                            <div className={styles.goalPair}>
                              <div className={styles.goalLabel}>Goal Type:</div>
                              <div className={styles.goalValue}>
                                {goal.type === 'Savings' && <>Savings</>}
                                {goal.type === 'Debt Reduction' && <>Debt Reduction</>}
                                {goal.type === 'Spending Limit' && (
                                  <>Spending Limit</>
                                )}
                              </div>
                            </div>
                            {goal.current_amount !== undefined && (
                              <div>
                                {goal.initial_amount !== undefined && (
                                  <>
                                    {goal.type == "Debt Reduction"? (

                                      <div className={styles.goalPair}>
                                        <div className={styles.goalLabel}>
                                        Initial Amount:
                                      </div>
                                      <div className={styles.goalValue}>
                                        R {goal.initial_amount.toFixed(2)}
                                      </div>
                                      </div>) : (<></>)}
                                  </>
                                )}
                                <div className={styles.goalPair}>
                                  <div className={styles.goalLabel}>
                                    Current Amount:
                                  </div>
                                  <div className={styles.goalValue}>
                                    R {goal.current_amount.toFixed(2)}
                                  </div>
                                </div>
                                {goal.type == "Savings" &&
                                  goal.target_amount ? (

                                  <div className={styles.goalPair}>
                                    <div className={styles.goalLabel}>
                                      Target Amount:
                                    </div>
                                    <div className={styles.goalValue}>
                                      R{goal.target_amount.toFixed(2)}
                                    </div>
                                  </div>) : (<></>)}
                              </div>
                            )}
                            {goal.target_date && (
                              <div>
                                <div className={styles.goalPair}>
                                  <div className={styles.goalLabel}>
                                    Target Date:
                                  </div>
                                  <div className={styles.goalValue}>
                                    {goal.target_date}
                                  </div>
                                </div>
                                <div className={styles.goalPair}>
                                  <div className={styles.goalLabel}>
                                    Days Left:
                                  </div>
                                  <div className={styles.goalValue}>
                                    {calculateDaysLeft(goal.target_date) > 0
                                      ? ` ${calculateDaysLeft(
                                        goal.target_date
                                      )}`
                                      : 'Target Date Passed'}
                                  </div>
                                </div>
                              </div>
                            )}
                            {goal.spending_limit !== undefined && (
                              <div className={styles.goalPair}>
                                <div className={styles.goalLabel}>
                                  Spending Limit:
                                </div>
                                <div className={styles.goalValue}>
                                  R {goal.spending_limit.toFixed(2)}
                                </div>
                              </div>
                            )}
                            {goal.spending_limit !== undefined && (
                              <div className={styles.goalPair}>
                                <div className={styles.goalLabel}>
                                  Spent this Month:
                                </div>
                                <div className={styles.goalValue}>
                                  R {monthlyBudgetSpent(goal).toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                          <div
                            className={styles.updateViewButton}
                            onClick={() => handleUpdateGoalPopup(index)}
                          >
                            Update Progress
                          </div>
                          {updatePopupOpen[index] && (
                            <UpdateGoalPopup
                              togglePopup={() => handleUpdateGoalPopup(index)}
                              goal={goal}
                            />
                          )}
                        </div>

                        {goal.current_amount !== undefined &&
                          goal.target_amount !== undefined && (
                            <GraphCarousel goal={goal} key={goal.id} />
                          )}
                        {goal.spending_limit !== undefined && (
                          <GraphCarousel goal={goal} key={goal.id} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <></>
            )*/}
          </div>
        </>
      )}
    </div>
  );
}

export default GoalsPage;
