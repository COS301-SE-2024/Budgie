import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';

import { GoalPageRevised } from '@capstone-repo/shared/budgie-components';
import { GoalsPage } from '@capstone-repo/shared/budgie-components';
import ComparisonPage from '../comparison-page/comparison-page';
import InsightsPage from '../insight-page/InsightsPage';
import { collection, getDocs, query, where } from '@firebase/firestore';

import { db } from '../../../../../apps/budgie-app/firebase/clientApp';

/* eslint-disable-next-line */
export interface PlanningPageRevisedProps {}

export function PlanningPageRevised(props: PlanningPageRevisedProps) {
  const [viewMode, setViewMode] = useState('goals');
  const user = useContext(UserContext);
  const router = useRouter();

  const [noAccounts, setNoAccounts] = useState(false);

  useEffect(() => {
    if (user && user.uid) {
      const checkNoAccount = async () => {
        const accRef = collection(db, 'accounts');
        const q = query(accRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.docs.length == 0) {
          setNoAccounts(true);
        }
      };

      checkNoAccount();
    }
  }, []);

  //if no accounts
  if (noAccounts) {
    return (
      <div className="mainPage">
        <div className="w-full text-xl text-center h-full flex flex-col items-center justify-center ">
          <p className="text-gray-500">
            You have not added any accounts to track <br />
            <br />
            Head to the accounts section to add a new account
          </p>
          <button
            onClick={() => {
              router.push('/accounts');
            }}
            className="mt-6 text-lg bg-gray-400 hover:bg-gray-500 shadow-lg p-3 rounded-xl text-BudgieWhite"
          >
            Take me there
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mainPage flex flex-col w-[85vw] items-center" style={{overflowY: 'hidden'}}>
      <div className=" flex shadow-lg z-2 justify-center rounded-2xl bg-[var(--block-background)] p-2 w-[98%] m-6">
        <button
          className={`rounded-sm px-5 hover:bg-opacity-75 hover:bg-BudgieBlue2 hover:text-BudgieWhite font-medium mr-16 cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
            viewMode === 'goals' ? 'border-b-4 border-BudgieBlue2' : ''
          }`}
          onClick={() => setViewMode('goals')}
        >
          Goals
        </button>
        <button
          className={`rounded-sm px-5 hover:bg-opacity-75 hover:bg-BudgieBlue2 hover:text-BudgieWhite font-medium cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
            viewMode === 'comparisons' ? 'border-b-4 border-BudgieBlue2' : ''
          }`}
          onClick={() => setViewMode('comparisons')}
        >
          Comparisons
        </button>
        <button
          className={`rounded-sm px-5 hover:bg-opacity-75 hover:bg-BudgieBlue2 hover:text-BudgieWhite font-medium ml-16 cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
            viewMode === 'insight' ? 'border-b-4 border-BudgieBlue2' : ''
          }`}
          onClick={() => setViewMode('insight')}
        >
          Insights
        </button>
      </div>
      <div className="flex-grow w-full">
        {viewMode === 'goals' ? (
          <GoalsPage/>
        ) : viewMode === 'comparisons' ? (
          <ComparisonPage />
        ) : viewMode === 'insight' ? (
          <InsightsPage />
        ) : null}
      </div>
    </div>
  );
}

export default PlanningPageRevised;
