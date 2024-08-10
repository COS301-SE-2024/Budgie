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
import {
  collection,
  getDocs,
  query,
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

interface Goal {
  id: string;
  name: string;
  type: string;
  start_date: string;
  initial_amount?: number;
  current_amount?: number;
  target_amount?: number;
  target_date?: string;
  spending_limit?: number;
  updates?: string;
  monthly_updates?: string;
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
          </div>
        )}

        {goal.type === 'Debt' && (
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
          </div>
        )}

        {goal.type === 'Debt' && goal.updates !== undefined && (
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
          </div>
        )}
        

        {goal.type === 'Spending' && (
          <div className={styles.carouselSlide} key="progress">
            <div className={styles.goalGraph}>
              <CircularProgressbar
                value={calculateProgressPercentage(goal)}
                styles={buildStyles({
                  pathColor: getColorForValue(calculateProgressPercentage(goal)),
                  trailColor: '#d6d6d6',
                })}
              />
              <div className={styles.percentageDisplay} style={{color: getColorForValue(calculateProgressPercentage(goal))}}>
                {`${calculateProgressPercentage(goal).toFixed(2)}%`}
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
          </div>
        )}

        {goal.type === 'Spending' && goal.updates !== undefined && (
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
          </div>
        )}


      </div>
    </div>
  );
};

export interface GoalsPageProps {}

export function GoalsPage() {
  const [Goals, setGoals] = useState<Goal[]>([]);
  const [isGoalPopupOpen, setIsGoalPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [updatePopupOpen, setUpdatePopupOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const user = useContext(UserContext);

  const calculateDaysLeft = (targetDate: string): number => {
    const currentDate = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const fetchGoals = async () => {
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
      setGoals(goalsList);
    } catch (error) {
      console.error('Error getting bank statement document:', error);
    }
  };

  const addGoalPopup = () => {
    setIsGoalPopupOpen(!isGoalPopupOpen);
    fetchGoals();
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleEditGoalPopup = (index: number) => {
    setEditPopupOpen((prevState) => ({
      ...prevState,
      [index]: !prevState[index], // Toggle the popup for the clicked goal
    }));
    fetchGoals();
  };

  const handleUpdateGoalPopup = (index: number) => {
    setUpdatePopupOpen((prevState) => ({
      ...prevState,
      [index]: !prevState[index], // Toggle the popup for the clicked goal
    }));
    fetchGoals();
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

  return (
    <div className={styles.mainPage}>
      <div className={styles.header}>
        <button className={styles.addGoalsButton} onClick={addGoalPopup}>
          Add a Goal
        </button>
        {isGoalPopupOpen && <AddGoalPopup togglePopup={addGoalPopup} />}
      </div>
      <div
        style={{
          width: '85vw',
          backgroundColor: 'var(--main-background)',
          marginBottom: 'calc((5rem * var(--font-size-multiplier)))',
        }}
      ></div>
      <div className={styles.planningModalContainer}>
        {Goals ? (
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
                            {goal.type === 'Debt' && <>Debt Reduction</>}
                            {goal.type === 'Spending' && <>Limiting Spending</>}
                          </div>
                        </div>
                        {goal.current_amount !== undefined &&
                          goal.target_amount !== undefined && (
                            <div>
                              {goal.initial_amount !== undefined && (
                                <div className={styles.goalPair}>
                                  <div className={styles.goalLabel}>
                                    Initial Amount:
                                  </div>
                                  <div className={styles.goalValue}>
                                    R {goal.initial_amount.toFixed(2)}
                                  </div>
                                </div>
                              )}
                              <div className={styles.goalPair}>
                                <div className={styles.goalLabel}>
                                  Current Amount:
                                </div>
                                <div className={styles.goalValue}>
                                  R {goal.current_amount.toFixed(2)}
                                </div>
                              </div>
                              <div className={styles.goalPair}>
                                <div className={styles.goalLabel}>
                                  Target Amount:
                                </div>
                                <div className={styles.goalValue}>
                                  R{goal.target_amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          )}
                        <div className={styles.goalPair}>
                          <div className={styles.goalLabel}>Start Date:</div>
                          <div className={styles.goalValue}>
                            {goal.start_date}
                          </div>
                        </div>
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
                              <div className={styles.goalLabel}>Days Left:</div>
                              <div className={styles.goalValue}>
                                {calculateDaysLeft(goal.target_date) > 0
                                  ? ` ${calculateDaysLeft(goal.target_date)}`
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
        )}
      </div>
    </div>
  );
}

export default GoalsPage;
