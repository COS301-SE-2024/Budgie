'use client';

import { useState } from 'react';
import styles from './add-accounts-page.module.css';
import { UploadStatementCSV } from '@capstone-repo/shared/budgie-components';

/* eslint-disable-next-line */
export interface AddAccountsPageProps {}

//modals and pages

interface AccountInfoModalProps {
  name: string;
  AccountNumber: string;
}

function AccountInfoModal(props: AccountInfoModalProps) {
  const handleChildElementClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    //exit modal
  };

  const handleUploadClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={() => {
        alert('outer click');
      }}
      className={styles.mainPageBlurModal}
    >
      <div
        className="flex flex-col items-center justify-center rounded-[3rem] w-[40%] h-3/4 bg-BudgieWhite "
        onClick={(e) => handleChildElementClick(e)}
      ></div>
    </div>
  );
}

export function AddAccountsPage(props: AddAccountsPageProps) {
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  const [accountType, setAccountType] = useState('');
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
    const [csvLoading, setCsvLoading] = useState(false);

    const handleExit = () => {
      setShowUploadCSVModal(!showUploadCSVModal);
    };

    const handleChildElementClick = (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      //ignore clicks
    };

    const handleCSVUpload = async (file: File) => {
      setCsvLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const lines = content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line);

        //get account name and number
        const InfoLine = lines.find((line) => line.startsWith('Date'));
        if (!InfoLine) {
          setError('fileformat');
        } else {
        }
      };
      setCsvLoading(false);
    };

    return (
      <div onClick={handleExit} className={styles.mainPageBlurModal}>
        <div
          className="flex flex-col items-center justify-center rounded-[2rem] w-96 h-96 bg-BudgieWhite "
          onClick={(e) => handleChildElementClick(e)}
        >
          {!csvLoading && (
            <>
              <span className="text-2xl text-center">
                Upload your transaction history <br /> in the form of a CSV{' '}
                <br /> to auto-detect account information.
              </span>
              <div className="mt-7">
                <UploadStatementCSV
                  onFileUpload={handleCSVUpload}
                ></UploadStatementCSV>
              </div>
            </>
          )}
          {csvLoading && <div>loading</div>}
        </div>
      </div>
    );
  }

  return (
    <>
      <AddAccountModal></AddAccountModal>
      {showUploadCSVModal && <UploadCSVModal></UploadCSVModal>}
    </>
  );
}

export default AddAccountsPage;