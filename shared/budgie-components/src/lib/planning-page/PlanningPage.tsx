'use client';

import React, { useEffect, useState, useContext } from 'react';
import ComparisonsPage from './ComparisonsPage';
import styles from './PlanningPage.module.css';
import {
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useThemeSettings } from '../../useThemes';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import AddGoalPopup from '../add-goal-popup/AddGoalPopup';
import EditGoalPopup from '../edit-goal-popup/EditGoalPopup';
import GoalsPage from '../goals-page/GoalsPage';
import UpdateGoalPopup, {
  UpdateGoalProgressPopup,
} from '../update-goal-progress-popup/UpdateGoalProgressPopup';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import '../../root.css';

/* eslint-disable-next-line */
export interface PlanningPageProps { }

export function GoalModal() {
  const [Goals, setGoals] = useState<Goal[]>([]);
  const [isGoalPopupOpen, setisGoalPopupOpen] = useState(false);
  const [isEditGoalPopupOpen, setisEditGoalPopupOpen] = useState(false);
  const [isUpdateGoalPopupOpen, setisUpdateGoalPopupOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal>({
    id: '',
    name: '',
    type: '',
    start_date: '',
  });
  const user = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Goals.length;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
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
    return 0;
  };

  const calculateDaysLeft = (targetDate: string): number => {
    const currentDate = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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
  }

  const addGoalPopup = () => {
    setisGoalPopupOpen(!isGoalPopupOpen);
    fetchGoals();
  };

  const editGoalPopup = () => {
    setisEditGoalPopupOpen(!isEditGoalPopupOpen);
    fetchGoals();
  };

  const updateGoalPopup = () => {
    setisUpdateGoalPopupOpen(!isUpdateGoalPopupOpen);
    fetchGoals();
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

  useEffect(() => {
    fetchGoals();
    setCurrentGoal(Goals[currentPage]);
  }, [Goals, isGoalPopupOpen, isEditGoalPopupOpen, isUpdateGoalPopupOpen]);

  useEffect(() => {
    fetchGoals();
    setCurrentGoal(Goals[0]);
  }, []);

  return (
    <div className={styles.planningModalContainer}>
      <div className={styles.planningModalTitle}>
        Goals
        <span
          className="material-symbols-outlined"
          style={{
            fontSize:
              'min(2.5rem, (calc(1.5rem * var(--font-size-multiplier))))',
            fontWeight: 500,
            color: 'var(--primary-text)',
            marginLeft: '1rem',
          }}
          onClick={addGoalPopup}
        >
          add_circle
        </span>
        {isGoalPopupOpen && <AddGoalPopup togglePopup={addGoalPopup} />}
      </div>
      <div className={styles.planningModal}>
        {Goals[1] && (
          <div className={styles.paginationControls}>
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 'calc(1.4rem * var(--font-size-multiplier))',
                  alignContent: 'center',
                  display: 'flex',
                }}
              >
                arrow_back_ios
              </span>
            </button>
            <span>{` ${currentPage + 1} of ${totalPages}`}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 'calc(1.4rem * var(--font-size-multiplier))',
                  alignContent: 'center',
                  display: 'flex',
                }}
              >
                arrow_forward_ios
              </span>
            </button>
          </div>
        )}
        {currentGoal === undefined ? (
          <div className={styles.noGoalsText}>
            You haven't added any goals yet.
            <br></br>
            <button className={styles.addGoalsButton} onClick={addGoalPopup}>
              Add a Goal
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div className={styles.goalsContainer}>
              <div className={styles.goalDisplay}>
                <div className={styles.goal}>
                  <div className={styles.goalName}>
                    {currentGoal.name}
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize:
                          'min(2.5rem, (calc(1.5rem * var(--font-size-multiplier))))',
                        fontWeight: 500,
                        color: 'var(--primary-text)',
                        marginLeft: '1rem',
                      }}
                      onClick={editGoalPopup}
                    >
                      edit
                    </span>
                    {/*{isEditGoalPopupOpen && (
                      <EditGoalPopup
                        togglePopup={editGoalPopup}
                        goal={currentGoal}
                      />
                    )}*/}
                  </div>

                  <div className={styles.goalPair}>
                    <div className={styles.goalLabel}>Goal Type:</div>
                    <div className={styles.goalValue}>
                      {currentGoal.type === 'Savings' && <>Savings</>}
                      {currentGoal.type === 'Debt' && <>Debt Reduction</>}
                      {currentGoal.type === 'Spending' && (
                        <>Limiting Spending</>
                      )}
                    </div>
                  </div>
                  {currentGoal.current_amount !== undefined &&
                    currentGoal.target_amount !== undefined && (
                      <div>
                        {currentGoal.initial_amount !== undefined && (
                          <div className={styles.goalPair}>
                            <div className={styles.goalLabel}>
                              Initial Amount:
                            </div>
                            <div className={styles.goalValue}>
                              {currentGoal.initial_amount}
                            </div>
                          </div>
                        )}
                        <div className={styles.goalPair}>
                          <div className={styles.goalLabel}>
                            Current Amount:
                          </div>
                          <div className={styles.goalValue}>
                            {currentGoal.current_amount}
                          </div>
                        </div>
                        <div className={styles.goalPair}>
                          <div className={styles.goalLabel}>Target Amount:</div>
                          <div className={styles.goalValue}>
                            {currentGoal.target_amount}
                          </div>
                        </div>
                      </div>
                    )}
                  <div className={styles.goalPair}>
                    <div className={styles.goalLabel}>Start Date:</div>
                    <div className={styles.goalValue}>
                      {currentGoal.start_date}
                    </div>
                  </div>
                  {currentGoal.target_date && (
                    <div>
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Target Date:</div>
                        <div className={styles.goalValue}>
                          {currentGoal.target_date}
                        </div>
                      </div>
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Days Left:</div>
                        <div className={styles.goalValue}>
                          {calculateDaysLeft(currentGoal.target_date) > 0
                            ? ` ${calculateDaysLeft(currentGoal.target_date)}`
                            : 'Target Date Passed'}
                        </div>
                      </div>
                    </div>
                  )}
                  {currentGoal.spending_limit !== undefined && (
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Spending Limit:</div>
                      <div className={styles.goalValue}>
                        {currentGoal.spending_limit}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={styles.updateViewButton}
                  onClick={updateGoalPopup}
                >
                  Update Progress
                </div>
                {isUpdateGoalPopupOpen && (
                  <UpdateGoalProgressPopup
                    togglePopup={updateGoalPopup}
                    goal={currentGoal}
                  />
                )}
              </div>

              {currentGoal.current_amount !== undefined &&
                currentGoal.target_amount !== undefined && (
                  <div className={styles.goalGraph}>
                    <CircularProgressbar
                      value={calculateProgressPercentage(currentGoal)}
                      styles={buildStyles({
                        pathColor: 'var(--primary-1)',
                        trailColor: '#d6d6d6',
                      })}
                    />
                    <div
                      className={styles.percentageDisplay}
                    >{`${calculateProgressPercentage(currentGoal).toFixed(
                      2
                    )}%`}</div>
                  </div>
                )}
              {currentGoal.spending_limit !== undefined && (
                <div className={styles.goalGraph}>Poop</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function UpcomingPaymentsBar() {
  return (
    <div className={styles.paymentsBar}>
      <div className={styles.paymentsBarTitle}>
        Upcoming Payments
        <span
          className="material-symbols-outlined"
          style={{
            fontSize:
              'min(2.5rem, (calc(1.5rem * var(--font-size-multiplier))))',
            fontWeight: 500,
            color: 'var(--BudgieGreen1)',
          }}
        >
          add_circle
        </span>
      </div>
    </div>
  );
}

export function PlanningPage(props: PlanningPageProps) {
  const [viewMode, setViewMode] = useState('goals');
  const user = useContext(UserContext);
  const [Goals, setGoals] = useState<Goal[]>([]);

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
  }
  useThemeSettings();

  useEffect(() => {
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
    fetchGoals();
  }, []);

  return (
    <div>
      <div className={styles.topBar}>
        <div>
          <button
            className={`${styles.button} ${viewMode === 'goals' ? styles.activeButton : ''
              }`}
            onClick={() => setViewMode('goals')}
          >
            Goals
          </button>

          <button
            className={`${styles.button} ${viewMode === 'insights' ? styles.activeButton : ''
              }`}
            onClick={() => setViewMode('insights')}
            style={{ marginLeft: '5rem' }}
          >
            Insights
          </button>

          <button
            className={`${styles.button} ${viewMode === 'upcoming' ? styles.activeButton : ''
              }`}
            onClick={() => setViewMode('upcoming')}
            style={{ marginLeft: '5rem' }}
          >
            Upcoming
          </button>
        </div>
      </div>
      <div>
        <div>
          {viewMode === 'goals' && Goals ? (
            <GoalsPage />
          ) : viewMode === 'insights' ? (
            <ComparisonsPage />
          ) : (
            <div className={styles.underConstructionScreen}>
              <div className={styles.underConstructionText}>
                This page is under construction.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanningPage;
