'use client';
import React, { useEffect, useState, useContext } from 'react';
import ComparisonsPage from './ComparisonsPage';
import InsightsPage from './InsightsPage';
import styles from './PlanningPage.module.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useThemeSettings } from '../../useThemes';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import GoalsPage from '../goals-page/GoalsPage';

export interface PlanningPageProps { }

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
        console.error('Error getting goals document:', error);
      }
    };
    fetchGoals();
  }, [user.uid]);

  return (
    <div>
      <div className={styles.topBar}>
        <div>
          <button
            className={`${styles.button} ${viewMode === 'goals' ? styles.activeButton : ''}`}
            onClick={() => setViewMode('goals')}
          >
            Goals
          </button>

          <button
            className={`${styles.button} ${viewMode === 'insights' ? styles.activeButton : ''}`}
            onClick={() => setViewMode('insights')}
            style={{ marginLeft: '5rem' }}
          >
            Insights
          </button>

          <button
            className={`${styles.button} ${viewMode === 'upcoming' ? styles.activeButton : ''}`}
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
          ) : viewMode === 'upcoming' ? (
            <InsightsPage /> // Updated to show InsightsPage for the 'Upcoming' tab
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
