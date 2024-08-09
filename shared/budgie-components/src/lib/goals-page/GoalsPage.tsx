'use client';

import React, { useEffect, useState, useContext } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import AddGoalPopup from '../add-goal-popup/AddGoalPopup';
import EditGoalPopup from '../edit-goal-popup/EditGoalPopup';
import styles from './GoalsPage.module.css';
import UpdateGoalPopup, {
  UpdateGoalProgressPopup,
} from '../update-goal-progress-popup/UpdateGoalProgressPopup';
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
}

export interface SliderProps {
  goal: Goal;
}

const Slider = ({ goal }: SliderProps) => {
  const [divs, setDivs] = useState<JSX.Element[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  useEffect(() => {
    const newSlides: JSX.Element[] = [];

    if (goal.type === 'Savings') {
      newSlides.push(
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
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent:'center'}}>
            <span className={styles.arrow} onClick={prevSlide}>
              &#8592;
            </span>
            <span className={styles.goalLabel} style={{marginLeft:'1rem', marginRight: '1rem'}}>Goal Progress</span>
            <span className={styles.arrow} onClick={nextSlide}>
              &#8594;
            </span>
          </div>
        </div>
      );

      newSlides.push(
        <div
          className={styles.slide}
          style={{ backgroundColor: 'orange', color: 'white' }}
          key="slide5"
        >
          Slide 5
        </div>
      );
    }

    setDivs(newSlides);
  }, [goal]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === divs.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? divs.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.slider}>{divs[currentIndex]}</div>
    </div>
  );
};
{
  /*<div className={styles.sliderContainer}>
      <div className={styles.arrow} onClick={prevSlide}>&#8592;</div>
      <div className={styles.slider}>{divs[currentIndex]}</div>
      <div className={styles.arrow} onClick={nextSlide}>&#8594;</div>
    </div>*/
}
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
                                    {goal.initial_amount}
                                  </div>
                                </div>
                              )}
                              <div className={styles.goalPair}>
                                <div className={styles.goalLabel}>
                                  Current Amount:
                                </div>
                                <div className={styles.goalValue}>
                                  {goal.current_amount}
                                </div>
                              </div>
                              <div className={styles.goalPair}>
                                <div className={styles.goalLabel}>
                                  Target Amount:
                                </div>
                                <div className={styles.goalValue}>
                                  {goal.target_amount}
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
                              {goal.spending_limit}
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
                        <UpdateGoalProgressPopup
                          togglePopup={() => handleUpdateGoalPopup(index)}
                          goal={goal}
                        />
                      )}
                    </div>

                    {goal.current_amount !== undefined &&
                      goal.target_amount !== undefined && (
                        <Slider goal={goal} key={goal.id} />
                      )}
                    {goal.spending_limit !== undefined && (
                      <div className={styles.goalGraph}>Graph</div>
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
