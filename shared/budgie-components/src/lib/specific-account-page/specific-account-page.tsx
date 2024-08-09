'use client';

import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './specific-account-page.module.css';
import { AreaChart, Color } from '@tremor/react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useParams } from 'next/navigation';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import {
  addDoc,
  collection,
  DocumentData,
  DocumentReference,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

/* eslint-disable-next-line */
export interface SpecificAccountPageProps {
  number: string | string[] | undefined;
}

interface GraphSectionProps {
  accNo: string | string[] | undefined;
  account: AccountInfo;
  setUploadLoading: Dispatch<SetStateAction<boolean>>;
  setShowSuccess: Dispatch<SetStateAction<boolean>>;
}

interface Transaction {
  date: string;
  amount: number;
  balance: number;
  description: string;
  category: string;
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

function splitMonthYear(monthYear: string): [string, string] {
  const month = monthYear.slice(0, 2); // Extracts the month (first 2 characters)
  const year = monthYear.slice(2); // Extracts the year (remaining characters)

  return [month, year];
}

async function getBalancesForMonthYears(
  years: number[],
  rollingMonthYears: string[],
  user: any,
  accNo: string | string[] | undefined
): Promise<Record<string, number>> {
  let returnData: Record<string, number> = {};
  for (const year of years) {
    const accRef = collection(db, `transaction_data_${year}`);
    const q = query(
      accRef,
      where('uid', '==', user.uid),
      where('account_number', '==', accNo?.toString())
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      for (const monthYear of rollingMonthYears) {
        const monthYearSplit = splitMonthYear(monthYear);
        const monthSplit = monthYearSplit[0];
        const yearSplit = monthYearSplit[1];
        const monthName = getMonthName(monthSplit);
        if (parseInt(yearSplit) == year) {
          if (data[monthName]) {
            const balance = JSON.parse(data[monthName])[0].balance;
            if (monthYear in returnData) {
              returnData[monthYear] = returnData[monthYear] + balance;
            } else {
              returnData[monthYear] = balance;
            }
          }
        }
      }
    }
  }

  for (const monthyear of rollingMonthYears) {
    if (!(monthyear in returnData)) {
      returnData[monthyear] = 0;
    }
  }

  return returnData;
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

function getUniqueYearMonths(DataLines: string[]): Record<string, string[]> {
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

async function MergeTransactions(
  YearMonthLinesRecord: Record<string, Transaction[]>,
  UniqueYearMonths: Record<string, string[]>,
  accountNumber: string,
  user: any
) {
  //determine merged record
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
          const Incoming: Transaction[] = JSON.parse(docSnap.data()[Month]);
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
            const combinedTransactions = [...Incoming, ...filteredOutgoing];
            combinedTransactions.sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);

              return dateB.getTime() - dateA.getTime();
            });
            const TransactionString = JSON.stringify(combinedTransactions);
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
      // const functions = getFunctions();
      // const categoriseExpenses = httpsCallable(
      //   functions,
      //   'categoriseExpenses'
      // );
      // console.log('first run');
      // categoriseExpenses({ year: Year });
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
      let docRef: DocumentReference<DocumentData, DocumentData> | null = null;
      for (const YearMonth in Merged) {
        let [year, month] = YearMonth.split('/');
        const TransactionString = JSON.stringify(Merged[YearMonth]);
        const TransactionMonthString = getMonthName(month);
        console.log(TransactionMonthString);
        console.log(TransactionString);
        if (first) {
          first = false;
          //add to db
          docRef = await addDoc(collection(db, `transaction_data_${year}`), {
            uid: user.uid,
            account_number: accountNumber,
            [TransactionMonthString]: TransactionString,
          });
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
      //call categorize function
      // const functions = getFunctions();
      // const categoriseExpenses = httpsCallable(
      //   functions,
      //   'categoriseExpenses'
      // );
      // console.log('first run');
      // categoriseExpenses({ year: Year });
    }
  }
}

const UploadTransactions = async (
  file: File,
  accountNumber: string,
  user: any
) => {
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
      await MergeTransactions(
        YearMonthLinesRecord,
        UniqueYearMonths,
        accountNumber,
        user
      );
    } else {
      //error incorrect csv format
      alert('Incorrect formatting of CSV');
    }
  };
  reader.readAsText(file);
};

function rollingYears(monthYear: string): number[] {
  // Extract the month and year from the input string
  const currentMonth = parseInt(monthYear.slice(0, 2));
  const currentYear = parseInt(monthYear.slice(2, 6));

  const years: number[] = [];

  // Loop through the 12 months
  for (let i = 0; i < 12; i++) {
    // Calculate the month and year for each step
    const month = currentMonth - i;

    if (month <= 0) {
      // If the month goes below 1, subtract from the year
      years.push(currentYear - 1);
    } else {
      years.push(currentYear);
    }
  }

  // Remove duplicates and return the list of years
  return Array.from(new Set(years)).sort();
}

function getCurrentMonthYear(): string {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11, so add 1
  const year = now.getFullYear().toString();

  return `${month}${year}`;
}

function getRollingMonthYears(monthYear: string): string[] {
  const currentMonth = parseInt(monthYear.slice(0, 2));
  const currentYear = parseInt(monthYear.slice(2, 6));

  const rollingMonthYears: string[] = [];

  for (let i = 0; i < 12; i++) {
    let month = currentMonth - i;
    let year = currentYear;

    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    const monthString = month.toString().padStart(2, '0');
    const monthYearString = `${monthString}${year}`;
    rollingMonthYears.push(monthYearString);
  }

  return rollingMonthYears.reverse();
}

function yearMonthToString(yearMonth: string): string {
  const split = splitMonthYear(yearMonth);
  let name = getMonthName(split[0]);
  name = name.charAt(0).toUpperCase() + name.slice(1);
  const year = split[1];

  return `${name} ${year}`;
}

//Components
function GraphSection(props: GraphSectionProps) {
  const user = useContext(UserContext);
  const router = useRouter();
  const [graphX, setGraphX] = useState<string[]>([]);
  const [graphY, setGraphY] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const fetchGraphData = async () => {
        const curr = getCurrentMonthYear();
        const affectedYears: number[] = rollingYears(curr);
        const rollingMonthYears: string[] = getRollingMonthYears(curr);

        const data: Record<string, number> = await getBalancesForMonthYears(
          affectedYears,
          rollingMonthYears,
          user,
          props.accNo
        );

        let xAxis: string[] = [];
        let yAxis: number[] = [];

        for (const yearmonth of rollingMonthYears) {
          xAxis.push(yearMonthToString(yearmonth));
          yAxis.push(data[yearmonth]);
        }
        setGraphX(xAxis);
        setGraphY(yAxis);
      };
      await fetchGraphData();
    };
    fetchData();
  }, []);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleUpload(file);
      event.target.value = '';
    }
  };

  const handleUpload = async (file: File) => {
    props.setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const lines = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);

      const InfoLine = lines.find((line) => line.startsWith('Account'));
      if (InfoLine) {
        const InfoLineArray = InfoLine.split(',').map((item) => item.trim());
        if (InfoLineArray[1] == props.account.number) {
          UploadTransactions(file, props.account.number, user).then(() => {
            props.setUploadLoading(false);
            props.setShowSuccess(true);
            setTimeout(() => {
              props.setShowSuccess(false);
              router.refresh();
            }, 1000);
          });
        } else {
          alert('error incorrect account');
        }
      } else {
        alert('error incorrect csv format');
      }
    };
    reader.readAsText(file);
  };

  let dataset = [];

  for (let i = 0; i < 12; i++) {
    dataset.push({ monthyear: graphX[i], Balance: graphY[i] });
  }
  return (
    graphX.length != 0 &&
    graphY.length != 0 && (
      <>
        <div>
          <span className="font-TripSans font-medium text-3xl">Balance</span>
          <button
            onClick={handleButtonClick}
            className="font-TripSans ml-4 font-medium text-xl text-BudgieGreen3 bg-BudgieGreen1 bg-opacity-30 hover:text-BudgieWhite hover:bg-BudgieGreen1 hover:bg-opacity-100 transition-all ease-in duration-150 p-2 rounded-2xl"
            // className="font-TripSans shadow-md font-medium text-xl text-BudgieBlue bg-BudgieAccentHover transition-all ease-in duration-200 hover:text-BudgieWhite hover:bg-BudgieAccentHover bg-opacity-60 p-2 rounded-2xl"
          >
            Upload Data
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>
        <AreaChart
          className=" w-[90%] h-[80%] "
          data={dataset}
          index="monthyear"
          categories={['Balance']}
          colors={['emerald']}
          yAxisWidth={60}
          showGridLines={false}
          showLegend={true}
          showAnimation={true}
        />
      </>
    )
  );
}

function InfoSection(props: InfoSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const user = useContext(UserContext);

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

function SuccessModal() {
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
      >
        <span className="text-center text-3xl font-TripSans font-bold">
          Financial data added
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

export function SpecificAccountPage(props: SpecificAccountPageProps) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
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
    <>
      <div className="mainPage">
        <InfoSection account={account}></InfoSection>
        <div className="w-full h-[65%] mt-[1rem] bg-BudgieWhite rounded-3xl flex flex-col items-center justify-center shadow-xl ">
          <GraphSection
            accNo={props.number}
            account={account}
            setUploadLoading={setUploadLoading}
            setShowSuccess={setSuccessModal}
          ></GraphSection>
        </div>
      </div>
      {uploadLoading && <SpinnerLoader></SpinnerLoader>}
      {successModal && <SuccessModal></SuccessModal>}
    </>
  );
}

export default SpecificAccountPage;
