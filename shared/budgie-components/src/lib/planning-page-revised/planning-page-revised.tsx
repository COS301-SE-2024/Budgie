import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';
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
  if (noAccounts && viewMode == 'comparisons') {
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
    <div className="bg-[var(--main-background)] pl-6 pr-6 pt-4 flex-grow portrait:fixed portrait:w-full portrait:pt-[12vh] portrait:pl-2 portrait:pr-2 font-medium overflow-y-hidden">
      <div className="flex flex-wrap shadow-md !z-100 justify-around rounded-2xl bg-[var(--primary-1)] landscape:h-[calc(3rem*var(--font-size-multiplier))] w-full sticky top-0 text-[var(--secondary-text)] portrait:flex-col portrait:items-center ">
        <button
          className={`rounded-sm px-5 hover:bg-opacity-75 hover:bg-[var(--primary-2)] hover:text-BudgieWhite cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
            viewMode === 'goals' ? 'border-b-4 border-white text-white' : ''
          }`}
          onClick={() => setViewMode('goals')}
        >
          Goals
        </button>
        <button
          className={`rounded-sm px-5 hover:bg-opacity-75 hover:bg-[var(--primary-2)] hover:text-BudgieWhite cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
            viewMode === 'comparisons' ? 'border-b-4 border-white' : ''
          }`}
          onClick={() => setViewMode('comparisons')}
        >
          Comparisons
        </button>
        <button
          className={`rounded-sm px-5 hover:bg-opacity-75 hover:bg-[var(--primary-2)] hover:text-BudgieWhite cursor-pointer text-[calc(1.4rem*var(--font-size-multiplier))] ${
            viewMode === 'insight' ? 'border-b-4 border-white' : ''
          }`}
          onClick={() => setViewMode('insight')}
        >
          Insights
        </button>
      </div>

      <div className="flex-grow w-full mt-4 overflow-y-hidden">
        {viewMode === 'goals' ? (
          <GoalsPage />
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
