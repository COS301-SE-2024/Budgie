'use client';

import styles from './accounts-page.module.css';
import '../../root.css';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import {
  collection,
  DocumentData,
  getDocs,
  query,
  QueryDocumentSnapshot,
  where,
} from 'firebase/firestore';
import { Diversity1 } from '@mui/icons-material';
/* eslint-disable-next-line */
export interface AccountsPageProps {}

//pages and modals------------------------------------------

interface Account {
  name: string;
  alias: string;
  type: string;
  number: string;
}
interface NoAccountsPageProps {
  onAddClick: () => void;
}

function NoAccountsPage(props: NoAccountsPageProps) {
  return (
    <div className="mainPage">
      <div className="flex items-center justify-center bg-BudgieGray h-full w-full">
        <div
          onClick={props.onAddClick}
          className="flex flex-col items-center justify-center bg-BudgieGray hover:bg-black hover:bg-opacity-5 h-80 w-80 border-dashed border-2 border-gray-400 border-opacity-40 hover:border-opacity-100 cursor-pointer  rounded-3xl"
        >
          <span className="text-2xl text-gray-400 text-opacity-60">
            No Accounts Added Yet
          </span>
          <span className="mt-5 text-xl text-gray-400 text-opacity-60">
            Add an Account
          </span>
          <span
            className="mt-2 text-opacity-50 text-gray-400 material-symbols-outlined"
            style={{
              fontSize: '3rem',
            }}
          >
            add
          </span>
        </div>
      </div>
    </div>
  );
}

interface AccountUnitProps {
  account: Account;
}

function AccountUnit(props: AccountUnitProps) {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push(`accounts/${props.account.number}`);
      }}
      className="w-[full] cursor-pointer shadow-md min-w-[23rem] max-w-[23rem] m-[1rem] rounded-[2rem] h-[21rem] flex flex-col items-center justify-center bg-BudgieWhite hover:shadow-2xl transition-shadow"
    >
      {props.account.type == 'current' && (
        <span
          className="text-black material-symbols-outlined"
          style={{
            fontSize: '9rem',
          }}
        >
          account_balance
        </span>
      )}
      {props.account.type == 'savings' && (
        <span
          className="text-black material-symbols-outlined"
          style={{
            fontSize: '9rem',
          }}
        >
          savings
        </span>
      )}
      {props.account.type == 'custom' && (
        <span
          className="text-black material-symbols-outlined"
          style={{
            fontSize: '9rem',
          }}
        >
          tune
        </span>
      )}
      <span className="font-TripSans font-medium text-3xl">
        {props.account.alias}
      </span>
      <span className="mt-4 font-TripSans font-medium opacity-25 text-sm">
        {props.account.name}
      </span>
    </div>
  );
}

function AddAccountIcon() {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push('/accounts/new');
      }}
      className="w-[full] cursor-pointer min-w-[23rem] max-w-[23rem] m-[1rem] rounded-[2rem] h-[21rem] flex flex-col items-center justify-center hover:bg-black hover:bg-opacity-5 border-dashed border-2 border-gray-400 border-opacity-40 hover:border-opacity-100"
    >
      <span className="mt-5 text-xl text-gray-400 text-opacity-60">
        Add an Account
      </span>
      <span
        className="mt-2 text-opacity-50 text-gray-400 material-symbols-outlined"
        style={{
          fontSize: '3rem',
        }}
      >
        add
      </span>
    </div>
  );
}

function GraphSection() {
  useEffect(() => {
    //fetch all account balances and sum
    //generate graph data
  }, []);
  return (
    //display graph and account balance data
    true
  );
}

function PageLoader() {
  return (
    <>
      <div className="mainPage">Loading</div>
    </>
  );
}

export function AccountsPage(props: AccountsPageProps) {
  const [pageLoader, setPageLoader] = useState(true);
  const [showNoAccounts, setShowNoAccounts] = useState(true);
  const [accountsArray, SetAccountsArray] = useState<Account[]>([]);

  const router = useRouter();
  const user = useContext(UserContext);

  useEffect(() => {
    const fetchAccounts = async () => {
      const accRef = collection(db, 'accounts');
      const q = query(accRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      // Do something with querySnapshot
      if (querySnapshot.docs.length == 0) {
        setShowNoAccounts(true);
      } else {
        let acc: Account[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const account: Account = {
            name: data.name,
            alias: data.alias,
            type: data.type,
            number: data.account_number,
          };
          acc.push(account);
        });
        SetAccountsArray(acc);
        setShowNoAccounts(false);
      }
    };
    fetchAccounts().then(() => {
      setPageLoader(false);
    });
  }, []);

  return (
    <>
      {showNoAccounts && !pageLoader && (
        <NoAccountsPage
          onAddClick={() => {
            router.push('/accounts/new');
          }}
        ></NoAccountsPage>
      )}
      {!showNoAccounts && !pageLoader && (
        <div className="mainPage">
          <div className="w-full h-[52%] shadow-lg bg-BudgieWhite rounded-[2rem]">
            <GraphSection></GraphSection>
          </div>
          <div className="w-full mt-[1rem] grid grid-cols-3">
            {accountsArray.map((account) => (
              <AccountUnit account={account}></AccountUnit>
            ))}
            <AddAccountIcon></AddAccountIcon>
          </div>
        </div>
      )}
    </>
  );
}

export default AccountsPage;
