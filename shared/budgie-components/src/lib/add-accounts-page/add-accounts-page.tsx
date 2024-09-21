'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import fnb from '../../../public/images/FNB_Color.png';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  DocumentSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentReference,
} from 'firebase/firestore';
import styles from './add-accounts-page.module.css';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Image from 'next/image';

/* eslint-disable-next-line */
export interface AddAccountsPageProps {}

export function AddAccountsPage(props: AddAccountsPageProps) {
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  const [accountType, setAccountType] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAccountAlreadyTracked, setShowAccountAlreadyTracked] =
    useState(false);
  const [loader, setLoader] = useState(false);
  const user = useContext(UserContext);
  const router = useRouter();

  function AddAccountModal() {
    function OnAddAccountTypeClick(type: string) {
      setAccountType(type);
      setShowUploadCSVModal(!showUploadCSVModal);
    }

    return (
      <div className="mainPage">
        <div
          className="flex items-center justify-center bg-BudgieGray h-full w-full"
          style={{ backgroundColor: 'var(--main-background)', color: 'black' }}
        >
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
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const handleExit = () => {
      setShowUploadCSVModal(!showUploadCSVModal);
    };

    const handleChildElementClick = (e: { stopPropagation: () => void }) => {
      //ignore clicks
      e.stopPropagation();
    };

    const handleCSVUpload = async (file: File) => {
      setUploadError('');
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
          setUploadError('File formatting');
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        handleCSVUpload(file);
        event.target.value = '';
      }
    };

    const handleButtonClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    return (
      <div onClick={handleExit} className={styles.mainPageBlurModal}>
        <div
          className="flex flex-col items-center justify-start rounded-[2rem] w-96 h-96 bg-BudgieWhite "
          onClick={(e) => handleChildElementClick(e)}
          style={{ backgroundColor: 'var(--main-background)' }}
        >
          <span className="text-2xl text-center mt-[5rem]">
            Upload your transaction history <br /> in the form of a CSV <br />{' '}
            to auto-detect account information.
          </span>
          <div className="mt-7">
            <button
              className="bg-BudgieWhite cursor-pointer rounded-3xl hover:bg-white hover:shadow-2xl transition-all ease-in"
              onClick={handleButtonClick}
            >
              <Image src={fnb} width={150} alt="FNB"></Image>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
          {uploadError != '' && (
            <span className="font-TripSans mt-[1rem] font-medium text-red-500">
              Error: {uploadError}
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
      setAliasError(false);
      setInputValue(e.target.value);
    };

    //uploadtransactions specific helpers---------------------------------
    interface Transaction {
      date: string;
      amount: number;
      balance: number;
      description: string;
      category: string;
    }

    function getSeparateYearMonthsAsTransactionObjects(
      DataLines: string[]
    ): Record<string, Transaction[]> {
      const linesByYearMonth: Record<string, Transaction[]> = {};

      for (const line of DataLines) {
        const [date, amountStr, balanceStr, description] = line
          .split(',')
          .map((part) => part.trim());
        const [year, month] = date.split('/');
        const yearMonth = `${year}/${month}`;
        const amount: number = parseFloat(amountStr);
        const balance: number = parseFloat(balanceStr);

        const transaction: Transaction = {
          date,
          amount,
          balance,
          description,
          category: '', // Initialize category as an empty string
        };

        if (!linesByYearMonth[yearMonth]) {
          linesByYearMonth[yearMonth] = [];
        }

        linesByYearMonth[yearMonth].push(transaction);
      }

      return linesByYearMonth;
    }

    function getUniqueYearMonths(
      DataLines: string[]
    ): Record<string, string[]> {
      const yearMonthsRecord: Record<string, Set<string>> = {};

      for (const line of DataLines) {
        const [date] = line.split(',');
        const [year, month] = date.split('/');
        const yearMonth = `${year}/${month}`;

        if (!yearMonthsRecord[year]) {
          yearMonthsRecord[year] = new Set();
        }

        yearMonthsRecord[year].add(yearMonth);
      }

      const result: Record<string, string[]> = {};

      for (const year in yearMonthsRecord) {
        result[year] = Array.from(yearMonthsRecord[year]);
      }

      return result;
    }

    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];

    function getMonthName(month: string): string {
      const monthIndex = parseInt(month, 10) - 1; // Months are zero-based
      if (monthIndex >= 0 && monthIndex < 12) {
        return monthNames[monthIndex];
      } else {
        throw new Error('Invalid month value');
      }
    }

    function isDuplicate(
      transaction1: Transaction,
      transaction2: Transaction
    ): boolean {
      return (
        transaction1.date === transaction2.date &&
        transaction1.amount === transaction2.amount &&
        transaction1.balance === transaction2.balance &&
        transaction1.description === transaction2.description
      );
    }

    async function updateYears(year: string) {
      if (user && user.uid) {
        const q = query(
          collection(db, 'years_uploaded'),
          where('uid', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          await addDoc(collection(db, 'years_uploaded'), {
            uid: user.uid,
            years: JSON.stringify([year]),
          });
        } else {
          let doc = querySnapshot.docs[0];
          const data = doc.data();
          let years: string[] = JSON.parse(data.years).map(String);
          if (!years.includes(year)) {
            years.push(year);
          }
          await updateDoc(doc.ref, {
            years: JSON.stringify(years),
          });
        }
      }
    }

    async function MergeTransactions(
      YearMonthLinesRecord: Record<string, Transaction[]>,
      UniqueYearMonths: Record<string, string[]>
    ) {
      //determine merged record
      if (user && user.uid) {
        for (const Year in UniqueYearMonths) {
          let Merged: Record<string, Transaction[]> = {};
          const YearMonths: string[] = UniqueYearMonths[Year];
          //check if exists
          const q = query(
            collection(db, `transaction_data_${Year}`),
            where('uid', '==', user.uid),
            where('account_number', '==', accountNumber)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            let docSnap = querySnapshot.docs[0];
            for (const YearMonth of YearMonths) {
              let [Y, Month] = YearMonth.split('/');
              Month = getMonthName(Month);
              if (docSnap.data()[Month]) {
                //month already contains data
                const Incoming: Transaction[] = JSON.parse(
                  docSnap.data()[Month]
                );
                const Outgoing: Transaction[] = YearMonthLinesRecord[YearMonth];
                //merge data duplicate removal
                const filteredOutgoing = Outgoing.filter(
                  (outgoingTransaction) =>
                    !Incoming.some((incomingTransaction) =>
                      isDuplicate(outgoingTransaction, incomingTransaction)
                    )
                );

                if (filteredOutgoing.length != 0) {
                  //there are some non duplicates merge and sort and update
                  const combinedTransactions = [
                    ...Incoming,
                    ...filteredOutgoing,
                  ];
                  combinedTransactions.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);

                    return dateB.getTime() - dateA.getTime();
                  });
                  const TransactionString =
                    JSON.stringify(combinedTransactions);
                  try {
                    await updateDoc(docSnap.ref, {
                      [Month]: TransactionString,
                    });
                  } catch (error) {
                    console.log(error);
                  }
                }
              } else {
                //empty month can just merge
                const Outgoing: Transaction[] = YearMonthLinesRecord[YearMonth];
                Outgoing.sort((a, b) => {
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);

                  return dateB.getTime() - dateA.getTime();
                });
                const TransactionString = JSON.stringify(Outgoing);
                try {
                  await updateDoc(docSnap.ref, {
                    [Month]: TransactionString,
                  });
                } catch (error) {
                  console.log(error);
                }
              }
            }
            //call categorize function
            try {
              const functions = getFunctions();
              const categoriseExpenses = httpsCallable(
                functions,
                'categoriseExpenses'
              );
              let res = await categoriseExpenses({ year: Year });
              console.log(res);
            } catch (error) {
              alert('function error');
            }
          } else {
            //documents do not exist for this year can safely add to merged
            for (const YearMonth of YearMonths) {
              Merged[YearMonth] = YearMonthLinesRecord[YearMonth];
            }
            // TODO: sort merged on date
            for (const YearMonth in Merged) {
              const MonthlyTransactions: Transaction[] = Merged[YearMonth];
              MonthlyTransactions.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);

                return dateB.getTime() - dateA.getTime();
              });
            }
            //upload merged!document does not exist must first set then update
            let first = true;
            let docRef: DocumentReference<DocumentData, DocumentData> | null =
              null;
            for (const YearMonth in Merged) {
              let [year, month] = YearMonth.split('/');
              const TransactionString = JSON.stringify(Merged[YearMonth]);
              const TransactionMonthString = getMonthName(month);
              if (first) {
                first = false;
                //add to db
                docRef = await addDoc(
                  collection(db, `transaction_data_${year}`),
                  {
                    uid: user.uid,
                    account_number: accountNumber,
                    [TransactionMonthString]: TransactionString,
                  }
                );
              } else {
                if (docRef != null) {
                  try {
                    await updateDoc(docRef, {
                      [TransactionMonthString]: TransactionString,
                    });
                  } catch (error) {
                    console.log(error);
                  }
                }
              }
            }
            // call categorize function
            try {
              const functions = getFunctions();
              const categoriseExpenses = httpsCallable(
                functions,
                'categoriseExpenses'
              );
              let res = await categoriseExpenses({ year: Year });
              console.log(res);
            } catch (error) {
              alert('function error');
            }
          }
          updateYears(Year);
        }
        SetUploadDate(accountNumber);
      }
    }

    async function SetUploadDate(accountNo: string) {
      if (user && user.uid) {
        if (accountNo.length == 0) {
          return;
        }
        const getCurrentDateString = () => {
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}/${month}/${day}`;
        };

        const q = query(
          collection(db, 'upload_dates'),
          where('uid', '==', user.uid),
          where('account_number', '==', accountNo)
        );

        let currentDate = getCurrentDateString();

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          let doc = querySnapshot.docs[0];
          let docRef = doc.ref;
          await updateDoc(docRef, {
            date: currentDate,
          });
        } else {
          await addDoc(collection(db, 'upload_dates'), {
            uid: user.uid,
            account_number: accountNo,
            date: currentDate,
          });
        }
      }
    }

    const UploadTransactions = async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const lines = content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line);

        //extract transaction lines
        const HeaderLine = lines.find((line) => line.startsWith('Date'));
        if (HeaderLine) {
          const DataLines = lines.slice(
            lines.indexOf(HeaderLine) + 1,
            lines.length
          );
          const YearMonthLinesRecord: Record<string, Transaction[]> =
            getSeparateYearMonthsAsTransactionObjects(DataLines);
          const UniqueYearMonths: Record<string, string[]> =
            getUniqueYearMonths(DataLines);
          await MergeTransactions(YearMonthLinesRecord, UniqueYearMonths);
        } else {
          //error incorrect csv format
          alert('Incorrect formatting of CSV');
        }
      };
      reader.readAsText(file);
    };

    //helpers
    const AccountAlreadyTracked = async (
      uid: string,
      accNo: string
    ): Promise<boolean> => {
      const accRef = collection(db, 'accounts');
      const q = query(
        accRef,
        where('account_number', '==', accNo),
        where('uid', '==', uid)
      );
      const querySnapshot = await getDocs(q);
      let flag = false;
      querySnapshot.forEach((doc) => {
        if (doc.exists()) {
          flag = true;
        }
      });

      return flag ? true : false;
    };

    const delay = (ms: number | undefined) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const handleAddAccountClick = async () => {
      if (user && user.uid) {
        if (inputValue == '') {
          setAliasError(true);
          return;
        }
        //add account to database
        //set spinner
        setShowAccountInfoModal(false);
        setLoader(true);
        if (
          accountType != '' &&
          accountName != '' &&
          accountNumber != '' &&
          inputValue != '' &&
          csvFile != null
        ) {
          let exists = await AccountAlreadyTracked(user.uid, accountNumber);
          if (exists) {
            await delay(1000);
            setLoader(false);
            setShowAccountAlreadyTracked(true);
            setTimeout(() => {
              setShowAccountAlreadyTracked(false);
            }, 1500);
            return;
          } else {
            //add financial data to db
            await UploadTransactions(csvFile);
            //add account after
            const docRef = await addDoc(collection(db, 'accounts'), {
              uid: user.uid,
              name: accountName,
              account_number: accountNumber,
              type: accountType,
              alias: inputValue,
            });
            //TODO:success modal for upload success
            await delay(1000);
            setLoader(false);
            setShowSuccessModal(true);
            setTimeout(() => {
              setShowSuccessModal(false);
              router.push('/accounts');
            }, 2000);
          }
        }
        //stop spinner
      }
    };

    return (
      <div onClick={handleExit} className={styles.mainPageBlurModal}>
        <div
          className="flex flex-col items-center justify-start rounded-[3rem] w-[45%] h-4/6 bg-BudgieGray "
          onClick={(e) => handleChildElementClick(e)}
          style={{ backgroundColor: 'var(--main-background)' }}
        >
          <span className="mt-3 text-3xl font-TripSans font-medium">
            Account Summary
          </span>
          <div
            className="bg-BudgieWhite shadow-lg mt-6 py-8 px-6 rounded-3xl flex flex-col items-start justify-center"
            style={{ backgroundColor: 'var(--block-background)' }}
          >
            <div className="">
              <span className="mr-3 text-2xl font-TripSans font-medium">
                Type:
              </span>
              <span
                className="text-BudgieWhite bg-BudgieBlue px-3 py-1 bg-opacity-90 rounded-lg text-2xl font-TripSans font-medium"
                style={{ backgroundColor: 'var(--primary-1)' }}
              >
                {accountType}
              </span>
            </div>
            <div className="mt-5">
              <span className="mr-3 text-2xl font-TripSans font-medium">
                Name:
              </span>
              <span
                className="text-BudgieWhite bg-BudgieBlue px-3 py-1 bg-opacity-90 rounded-lg text-2xl font-TripSans font-medium"
                style={{ backgroundColor: 'var(--primary-1)' }}
              >
                {accountName}
              </span>
            </div>
            <div className="mt-5">
              <span className="mr-3 text-2xl font-TripSans font-medium">
                Account Number:
              </span>
              <span
                className="text-BudgieWhite bg-BudgieBlue px-3 py-1 bg-opacity-90 rounded-lg text-2xl font-TripSans font-medium"
                style={{ backgroundColor: 'var(--primary-1)' }}
              >
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
              className={`${
                !aliasError
                  ? 'bg-white text-3xl w-2/3 mt-3 px-5 py-4 rounded-xl border-2 border-[#07456F] outline-none focus:border-1 focus:border-BudgieAccentHover'
                  : 'bg-white text-3xl w-2/3 mt-3 px-5 py-4 rounded-xl border-2 border-red-400 outline-none focus:border-1 focus:border-red-400'
              }`}
              type="text"
              style={{ color: 'black' }}
            />
          </div>
          <button
            onClick={handleAddAccountClick}
            className="mt-12 bg-[#07456F] hover:shadow-2xl hover:bg-BudgieAccentHover  text-BudgieWhite text-2xl p-3 rounded-3xl font-bold transition-all ease-in"
          >
            Add Account
          </button>
        </div>
      </div>
    );
  }

  function SuccessModal() {
    const handleExit = () => {
      setShowSuccessModal(false);
    };

    const handleChildElementClick = (e: { stopPropagation: () => void }) => {
      //ignore clicks
      e.stopPropagation();
    };

    return (
      <div onClick={handleExit} className={styles.mainPageBlurModal}>
        <div
          className="flex flex-col items-center justify-center rounded-[2rem] w-96 h-96 bg-BudgieWhite "
          onClick={(e) => handleChildElementClick(e)}
          style={{ backgroundColor: 'var(--block-background)' }}
        >
          <span className="text-center text-3xl font-TripSans font-bold">
            Account and financial <br />
            data added
          </span>
          <span
            className="mt-6 text-BudgieGreen1 material-symbols-outlined"
            style={{
              fontSize: '9rem',
            }}
          >
            verified
          </span>
        </div>
      </div>
    );
  }

  function AlreadyTracked() {
    const handleExit = () => {
      setShowAccountAlreadyTracked(false);
    };

    const handleChildElementClick = (e: { stopPropagation: () => void }) => {
      //ignore clicks
      e.stopPropagation();
    };

    return (
      <div onClick={handleExit} className={styles.mainPageBlurModal}>
        <div
          className="flex flex-col items-center justify-center rounded-[2rem] w-96 h-96 bg-BudgieWhite "
          onClick={(e) => handleChildElementClick(e)}
        >
          <span className="text-center text-3xl font-TripSans font-bold">
            Account already <br />
            tracking
          </span>
          <span
            className="mt-6 text-red-400 material-symbols-outlined"
            style={{
              fontSize: '9rem',
            }}
          >
            close
          </span>
        </div>
      </div>
    );
  }

  function SpinnerLoader() {
    const handleExit = () => {};

    const handleChildElementClick = (e: { stopPropagation: () => void }) => {
      //ignore clicks
      e.stopPropagation();
    };

    return (
      <div onClick={handleExit} className={styles.mainPageBlurModal}>
        <div
          className="flex flex-col items-center justify-center rounded-[2rem] w-96 h-96 bg-BudgieWhite "
          onClick={(e) => handleChildElementClick(e)}
          style={{ backgroundColor: 'var(--block-background)' }}
        >
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-400 fill-BudgieAccentHover"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AddAccountModal></AddAccountModal>
      {showUploadCSVModal && <UploadCSVModal></UploadCSVModal>}
      {showAccountInfoModal && <AccountInfoModal></AccountInfoModal>}
      {showSuccessModal && <SuccessModal></SuccessModal>}
      {showAccountAlreadyTracked && <AlreadyTracked></AlreadyTracked>}
      {loader && <SpinnerLoader></SpinnerLoader>}
    </>
  );
}

export default AddAccountsPage;
