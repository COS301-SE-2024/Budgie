'use client';

import { useContext, useEffect, useState } from 'react';
import styles from './specific-account-page.module.css';
import { AreaChart, Color } from '@tremor/react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useParams } from 'next/navigation';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { collection, getDocs, query, where } from 'firebase/firestore';

/* eslint-disable-next-line */
export interface SpecificAccountPageProps {
  number: string | string[] | undefined;
}

interface GraphSectionProps {
  xAxis: string[];
  yAxis: number[];
}

interface AccountInfo {
  name: string;
  alias: string;
  type: string;
  number: string;
}

interface InfoSectionProps {
  account: AccountInfo;
}
//helpers

async function getBalancesForMonthYears(
  years: number[],
  rollingMonthYears: string[],
  user: any
): Promise<Record<string, number>> {
  return {};
}

//Components

function GraphSection(props: GraphSectionProps) {}

function InfoSection(props: InfoSectionProps) {
  const router = useRouter();

  function handleUpload() {}

  function handleDelete() {}

  function handleback() {
    router.back();
  }

  function handleEdit(Property: string) {}

  return (
    <div className="w-full h-[28%] flex flex-col items-center justify-start shadow-md bg-BudgieWhite rounded-[2rem]">
      <div className="mt-4 w-full flex items-center justify-between">
        <span
          onClick={handleback}
          className="material-symbols-outlined ml-8 hover:bg-gray-200 p-1 transition-all rounded-xl text-black"
          style={{
            fontSize: '2rem',
          }}
        >
          arrow_back
        </span>
        <div>
          <span className="font-TripSans font-medium mr-3 text-3xl">
            {props.account.alias}
          </span>
          <button
            onClick={handleUpload}
            className="font-TripSans font-medium text-xl text-BudgieBlue bg-BudgieAccentHover transition-all hover:text-BudgieWhite hover:bg-BudgieAccentHover bg-opacity-60 p-2 rounded-2xl"
          >
            Upload Data (.csv)
          </button>
        </div>
        <span
          onClick={handleDelete}
          className="material-symbols-outlined mr-8 hover:bg-red-400 hover:text-BudgieWhite p-1 transition-all rounded-xl text-red-600 bg-red-200"
          style={{
            fontSize: '2rem',
          }}
        >
          delete_forever
        </span>
      </div>
      <div className="w-full grow flex items-start justify-start">
        <div className="bg-BudgieAccentHover h-[85%] ml-20 w-[0.5rem] rounded-lg"></div>
        <div className="flex font-TripSans font-bold ml-2 text-xl text-Black flex-col items-start justify-center">
          <span className=" p-1 rounded-lg">{props.account.name}</span>
          <span className=" p-1 rounded-lg">{props.account.number}</span>
          <div className="flex items-center justify-center">
            <span className=" p-1 flex items-center justify-center rounded-lg">
              Alias: {props.account.alias}
            </span>
            <span
              onClick={() => {
                handleEdit('alias');
              }}
              className="material-symbols-outlined ml-1 transition-all hover:bg-gray-200 p-1 rounded-xl text-BudgieAccentHover"
              style={{
                fontSize: '1.5rem',
              }}
            >
              edit
            </span>
          </div>
          <div className="flex items-center justify-center">
            <span className=" p-1 flex items-center justify-center rounded-lg">
              Type: {props.account.type}
            </span>
            <span
              onClick={() => {
                handleEdit('type');
              }}
              className="material-symbols-outlined ml-1 transition-all hover:bg-gray-200 p-1 rounded-xl text-BudgieAccentHover"
              style={{
                fontSize: '1.5rem',
              }}
            >
              edit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SpecificAccountPage(props: SpecificAccountPageProps) {
  const [graphX, setGraphX] = useState<string[]>([]);
  const [graphY, setGraphY] = useState<number[]>([]);
  const [account, setAccount] = useState<AccountInfo>({
    name: '',
    alias: '',
    type: '',
    number: '',
  });

  const router = useRouter();
  const user = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      const getInfoData = async () => {
        const accRef = collection(db, 'accounts');
        const q = query(
          accRef,
          where('uid', '==', user.uid),
          where('account_number', '==', props.number)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          const account: AccountInfo = {
            name: data.name,
            alias: data.alias,
            type: data.type,
            number: data.account_number,
          };
          setAccount(account);
        } else {
          alert('problem fetching account');
        }
      };
      getInfoData();
    };

    fetchData();
  }, []);

  return (
    <div className="mainPage">
      <InfoSection account={account}></InfoSection>
      <div className="w-full h-[65%] mt-[1rem] bg-BudgieWhite rounded-3xl flex flex-col items-center justify-center shadow-xl ">
        <span className="font-TripSans font-medium text-3xl">Balance</span>
        {/* <BalanceChart dataset={dataset}></BalanceChart> */}
      </div>
    </div>
  );
}

export default SpecificAccountPage;
