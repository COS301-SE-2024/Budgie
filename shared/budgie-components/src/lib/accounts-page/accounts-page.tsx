'use client';

import styles from './accounts-page.module.css';
import '../../root.css';
import { useEffect, useState } from 'react';
/* eslint-disable-next-line */
export interface AccountsPageProps {}

function onAddAccountClick() {
  alert('add account');
}

function NoAccountsPage() {
  return (
    <div className="mainPage">
      <div className="flex items-center justify-center bg-BudgieGrayLight h-full w-full">
        <div
          onClick={() => onAddAccountClick()}
          className="flex flex-col items-center justify-center bg-BudgieGrayLight hover:bg-black hover:bg-opacity-5 h-80 w-80 border-dashed border-2 border-gray-400 border-opacity-40 hover:border-opacity-100 cursor-pointer  rounded-3xl"
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

function AddAccountModal() {
  return (
    <div className="mainPage">
      <div className="flex items-center justify-center bg-BudgieGrayLight h-full w-full">
        <div className="bg-gray-300 w-96 h-3/4 rounded-l-[2.5rem] hover:shadow-inner">
          Hello
        </div>
        <div className="bg-slate-400 w-96 h-3/4">Hello</div>
        <div className="bg-white w-96 h-3/4 rounded-r-[2.5rem]">Hello</div>
      </div>
    </div>
  );
}

export function AccountsPage(props: AccountsPageProps) {
  useEffect(() => {}, []);

  return AddAccountModal();
}

export default AccountsPage;
