'use client';

import styles from './accounts-page.module.css';
import '../../root.css';
import { useEffect, useState } from 'react';
import { UploadStatementCSV } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';
/* eslint-disable-next-line */
export interface AccountsPageProps {}

//pages and modals------------------------------------------
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

export function AccountsPage(props: AccountsPageProps) {
  const [showNoAccounts, setShowNoAccounts] = useState(true);
  const router = useRouter();
  useEffect(() => {}, []);

  return (
    <>
      {showNoAccounts && (
        <NoAccountsPage
          onAddClick={() => {
            router.push('/accounts/new');
          }}
        ></NoAccountsPage>
      )}
    </>
  );
}

export default AccountsPage;
