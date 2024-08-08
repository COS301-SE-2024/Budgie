'use client';

import React, { useEffect, useState, useContext } from 'react';
import styles from './PlanningPage.module.css';
import {
  collection,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import AddGoalPopup from '../add-goal-popup/AddGoalPopup';
import '../../root.css';

/* eslint-disable-next-line */
export interface PlanningPageProps {}

export function GoalModal() {
  const [Goals, setGoals] = useState<Goal[]>([]);
  const [isGoalPopupOpen, setisGoalPopupOpen] = useState(false);
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

  const calculateProgressPercentage = (
    currentAmount: number,
    targetAmount: number
  ): number => {
    if (targetAmount === 0) return 0;
    return Math.min(100, (currentAmount / targetAmount) * 100);
  };

  const calculateDaysLeft = (targetDate: string): number => {
    const currentDate = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentGoal = Goals[currentPage];

  interface Goal {
    id: string;
    name: string;
    type: string;
    start_date: string;
    current_amount?: number;
    target_amount?: number;
    target_date?: string;
    spending_limit?: number;
  }

  const togglePopup = () => {
    setisGoalPopupOpen(!isGoalPopupOpen);
  };

  const addGoalPopup = () => {
    setisGoalPopupOpen(!isGoalPopupOpen);
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
      console.log(goalsList);
    } catch (error) {
      console.error('Error getting bank statement document:', error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [Goals]);
 

  return (
    <div className={styles.planningModalContainer}>
      <p className={styles.planningModalTitle}>Goals</p>
      <div className={styles.planningModal}>
        {!currentGoal ? (
          <div className={styles.noGoalsText}>
            You haven't added any goals yet.
            <br></br>
            <button className={styles.addGoalsButton} onClick={addGoalPopup}>
              Add a Goal
            </button>
            {isGoalPopupOpen && <AddGoalPopup togglePopup={togglePopup} />}
          </div>
        ) : (
          <div>
            <div className={styles.goalsContainer}>
              <div className={styles.goalDisplay}>
                <div className={styles.goal}>
                  <div className={styles.goalName}>{currentGoal.name}</div>

                  <div className={styles.goalPair}>
                    <div className={styles.goalLabel}>Type:</div>
                    <div className={styles.goalValue}>{currentGoal.type}</div>
                  </div>
                  {currentGoal.current_amount !== undefined &&
                    currentGoal.target_amount !== undefined && (
                      <div>
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
                        <div className={styles.goalPair}>
                          <div className={styles.goalLabel}>Progress:</div>
                          <div className={styles.goalValue}>
                            {calculateProgressPercentage(
                              currentGoal.current_amount,
                              currentGoal.target_amount
                            ).toFixed(2)}
                            %
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
                          {calculateDaysLeft(currentGoal.target_date) > 0 ? ` ${calculateDaysLeft(currentGoal.target_date)}` : "Target Date Passed"}
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
              </div>
              <div className={styles.goalGraph}></div>
            </div>
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
              <span>{`Goal ${currentPage + 1} of ${totalPages}`}</span>
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
  return (
    <div className="mainPage">
      <div className={styles.pageContainer}>
        <div className={styles.scrollableSection}>
          <GoalModal></GoalModal>
        </div>
        <UpcomingPaymentsBar></UpcomingPaymentsBar>
      </div>
    </div>
  );
}

export default PlanningPage;
