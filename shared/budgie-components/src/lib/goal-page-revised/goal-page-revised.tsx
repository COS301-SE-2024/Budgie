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
import styles from './goal-page-revised.module.css';
import UpdateGoalPopup from '../update-goal-progress-popup/UpdateGoalProgressPopup';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import '../../root.css';

export interface GoalsPageProps {}

export function GoalPageRevised() {
  const [isGoalPopupOpen, setIsGoalPopupOpen] = useState(false);
  const [hasGoals, setHasGoals] = useState(false);
  const user = useContext(UserContext);

  const addGoalPopup = () => {
    setIsGoalPopupOpen(!isGoalPopupOpen);
  };

  return (
    <>
      {!hasGoals ? (
        <div className="flex flex-col items-center justify-center bg-[var(--main-background)] h-full">
          <div className="text-2xl">Add your first goal:</div>
          <button
            className="text-2xl mt-4 bg-BudgieBlue2 hover:bg-BudgieAccentHover transition-colors text-white p-4 rounded-2xl"
            onClick={addGoalPopup}
          >
            Add Goal
          </button>
          {isGoalPopupOpen && <AddGoalPopup togglePopup={addGoalPopup} />}
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}

export default GoalPageRevised;
