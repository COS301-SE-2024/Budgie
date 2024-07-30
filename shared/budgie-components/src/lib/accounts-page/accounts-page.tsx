'use client';

import styles from './accounts-page.module.css';
import '../../root.css';
import { useEffect, useState } from 'react';
/* eslint-disable-next-line */
export interface AccountsPageProps {}

//helper functions-------------------------------

function onAddAccountClick() {
  alert('add account');
}

function OnAddCurrentClick() {
  alert('add current');
}

function OnAddSavingsClick() {
  alert('add savings');
}

function OnAddCustomClick() {
  alert('add custom');
}

//pages------------------------------------------

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
        <div className="flex bg-black w-[72rem] h-3/4 rounded-[3rem] shadow-[0px_0px_40px_0px_rgba(0,0,15,0.2)]">
          <div
            onClick={OnAddCurrentClick}
            className="flex flex-col items-center cursor-pointer bg-[rgb(228,228,228)] w-96 h-full rounded-l-[2.5rem] hover:z-50 hover:shadow-[0px_0px_40px_0px_rgba(0,0,15,0.2)] transition-shadow ease-in duration-200"
          >
            <span
              className="mt-24 text-black material-symbols-outlined"
              style={{
                fontSize: '9rem',
              }}
            >
              account_balance
            </span>
            <span className=" text-2xl font-TripSans font-medium">
              Current Account
            </span>
            <span className="mt-16 text-[rgba(160,160,160,0.8)] text-center text-xl font-TripSans font-medium">
              This is an account where you receive <br /> your paycheque and
              make daily <br /> payments.
            </span>
          </div>
          <div
            onClick={OnAddSavingsClick}
            className="flex flex-col items-center cursor-pointer bg-[rgb(238,238,238)] w-96 h-full hover:z-50 hover:shadow-[0px_0px_40px_0px_rgba(0,0,15,0.2)] transition-shadow ease-in duration-200"
          >
            <span
              className="mt-24 text-black material-symbols-outlined"
              style={{
                fontSize: '9rem',
              }}
            >
              savings
            </span>
            <span className=" text-2xl font-TripSans font-medium">
              Savings Account
            </span>
            <span className="mt-16 text-[rgba(160,160,160,0.8)] text-center text-xl font-TripSans font-medium">
              This is an account where you save and earn interest on your money.
            </span>
          </div>
          <div
            onClick={OnAddCustomClick}
            className="flex flex-col items-center cursor-pointer bg-[rgb(248,248,248)] w-96 h-full rounded-r-[2.5rem] hover:z-50 hover:shadow-[0px_0px_40px_0px_rgba(0,0,15,0.2)] transition-shadow ease-in duration-200"
          >
            <span
              className="mt-24 text-black material-symbols-outlined"
              style={{
                fontSize: '9rem',
              }}
            >
              tune
            </span>
            <span className=" text-2xl font-TripSans font-medium">
              Custom Account
            </span>
            <span className="mt-16 text-[rgba(160,160,160,0.8)] text-center text-xl font-TripSans font-medium">
              Add any additional account you feel <br /> does not fit into the
              previous two categories.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountsPage(props: AccountsPageProps) {
  useEffect(() => {}, []);

  return AddAccountModal();
}

export default AccountsPage;
