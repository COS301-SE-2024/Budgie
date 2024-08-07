'use client';

import React, { useState } from 'react';
import styles from './PlanningPage.module.css';
import AddGoalPopup from '../add-goal-popup/AddGoalPopup';
import '../../root.css';

/* eslint-disable-next-line */
export interface PlanningPageProps {}

export function GoalModal() {
  const [Goals, setGoals] = useState<any>(null);
  const [isGoalPopupOpen, setisGoalPopupOpen] = useState(false);

  const togglePopup = () => {
    setisGoalPopupOpen(!isGoalPopupOpen);
  };


  const addGoalPopup = () => {
    setisGoalPopupOpen(!isGoalPopupOpen);
  };

  return (
    <div className={styles.planningModalContainer}>
      <p className={styles.planningModalTitle}>Goals</p>
      <div className={styles.planningModal}>
        {Goals === null?
          (
          <div className={styles.noGoalsText}>
            You haven't added any goals yet. 
            <br></br>
            <button className={styles.addGoalsButton} onClick={addGoalPopup}>
              Add a Goal
            </button>
            {isGoalPopupOpen && <AddGoalPopup togglePopup={togglePopup}/>}
          </div>
          ):(
          <div>

          </div>
          )
        }
        
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
                fontSize:'min(2.5rem, (calc(1.5rem * var(--font-size-multiplier))))',
                fontWeight: 500,
                color: "var(--BudgieGreen1)"
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
