'use client';

import { useEffect, useState } from 'react';
import styles from './add-accounts-page.module.css';
import { UploadStatementCSV } from '@capstone-repo/shared/budgie-components';

/* eslint-disable-next-line */
export interface AddAccountsPageProps {}

export function AddAccountsPage(props: AddAccountsPageProps) {
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  const [accountType, setAccountType] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  function AddAccountModal() {
    function OnAddAccountTypeClick(type: string) {
      setAccountType(type);
      setShowUploadCSVModal(!showUploadCSVModal);
    }

    return (
      <div className="mainPage">
        <div className="flex items-center justify-center bg-BudgieGray h-full w-full">
          <div className="flex bg-black w-[72rem] h-3/4 rounded-[3rem] shadow-[0px_0px_40px_0px_rgba(0,0,15,0.2)]">
            <div
              onClick={() => OnAddAccountTypeClick('current')}
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
              onClick={() => OnAddAccountTypeClick('savings')}
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
                This is an account where you save and earn interest on your
                money.
              </span>
            </div>
            <div
              onClick={() => OnAddAccountTypeClick('custom')}
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

  function UploadCSVModal() {
    const handleExit = () => {
      setShowUploadCSVModal(!showUploadCSVModal);
    };

    const handleChildElementClick = (e: { stopPropagation: () => void }) => {
      //ignore clicks
      e.stopPropagation();
    };

    const handleCSVUpload = async (file: File) => {
      setError('');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const lines = content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line);

        //get account name and number
        const InfoLine = lines.find((line) => line.startsWith('Account'));
        if (!InfoLine) {
          setError('File formatting');
        } else {
          const InfoLineArray = InfoLine.split(',').map((item) => item.trim());
          setAccountName(InfoLineArray[2].slice(1, -1));
          setAccountNumber(InfoLineArray[1]);
          setCsvFile(file);
          setShowUploadCSVModal(!showUploadCSVModal);
          setShowAccountInfoModal(!showAccountInfoModal);
        }
      };
      reader.readAsText(file);
    };

    return (
      <div onClick={handleExit} className={styles.mainPageBlurModal}>
        <div
          className="flex flex-col items-center justify-start rounded-[2rem] w-96 h-96 bg-BudgieWhite "
          onClick={(e) => handleChildElementClick(e)}
        >
          <span className="text-2xl text-center mt-[5rem]">
            Upload your transaction history <br /> in the form of a CSV <br />{' '}
            to auto-detect account information.
          </span>
          <div className="mt-7">
            <UploadStatementCSV
              onFileUpload={handleCSVUpload}
            ></UploadStatementCSV>
          </div>
          {error != '' && (
            <span className="font-TripSans mt-[1rem] font-medium text-red-500">
              Error: {error}
            </span>
          )}
        </div>
      </div>
    );
  }

  function AccountInfoModal() {
    const [aliasError, setAliasError] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleExit = () => {
      setShowAccountInfoModal(!showAccountInfoModal);
    };

    const handleChildElementClick = (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      //do nothing prevents click
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleAddAccountClick = () => {
      //add account to database
      //add financial data to db
    };

    return (
      <div onClick={handleExit} className={styles.mainPageBlurModal}>
        <div
          className="flex flex-col items-center justify-start rounded-[3rem] w-[45%] h-4/6 bg-BudgieGray "
          onClick={(e) => handleChildElementClick(e)}
        >
          <span className="mt-3 text-3xl font-TripSans font-medium">
            Account Summary
          </span>
          <div className="bg-BudgieWhite shadow-lg mt-6 py-8 px-6 rounded-3xl flex flex-col items-start justify-center">
            <div className="">
              <span className="mr-3 text-2xl font-TripSans font-medium">
                Type:
              </span>
              <span className="text-BudgieWhite bg-BudgieBlue px-3 py-1 bg-opacity-90 rounded-lg text-2xl font-TripSans font-medium">
                {accountType}
              </span>
            </div>
            <div className="mt-5">
              <span className="mr-3 text-2xl font-TripSans font-medium">
                Name:
              </span>
              <span className="text-BudgieWhite bg-BudgieBlue px-3 py-1 bg-opacity-90 rounded-lg text-2xl font-TripSans font-medium">
                {accountName}
              </span>
            </div>
            <div className="mt-5">
              <span className="mr-3 text-2xl font-TripSans font-medium">
                Account Number:
              </span>
              <span className="text-BudgieWhite bg-BudgieBlue px-3 py-1 bg-opacity-90 rounded-lg text-2xl font-TripSans font-medium">
                {accountNumber}
              </span>
            </div>
          </div>
          <div className="flex justify-center items-baseline w-full mt-5">
            <span className="mt-10 mr-4 text-3xl font-TripSans font-medium">
              Alias:
            </span>
            <input
              autoFocus
              spellCheck="false"
              onChange={handleChange}
              className="bg-white text-3xl w-2/3 mt-3 px-5 py-4 rounded-xl border-2 border-BudgiePrimary2 outline-none focus:border-2 focus:border-BudgieAccentHover"
              type="text"
            />
          </div>
          <button
            onClick={handleAddAccountClick}
            className="mt-12 text-BudgieWhite text-2xl p-3 rounded-3xl font-bold bg-BudgiePrimary2 hover:bg-BudgieAccentHover transition-colors ease-in"
          >
            Add Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AddAccountModal></AddAccountModal>
      {showUploadCSVModal && <UploadCSVModal></UploadCSVModal>}
      {showAccountInfoModal && <AccountInfoModal></AccountInfoModal>}
    </>
  );
}

export default AddAccountsPage;
