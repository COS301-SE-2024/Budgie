import styles from './overview-page-revised.module.css';
import '../../root.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { useRouter } from 'next/navigation';
import { Balance } from '@mui/icons-material';

/* eslint-disable-next-line */
export interface OverviewPageRevisedProps {}

type Transaction = {
  date: string;
  amount: number;
  balance: number;
  description: string;
  category: string;
};

type Account = {
  name: string;
  alias: string;
  type: string;
  number: string;
};

type specificAccData = {
  account: Account | null;
  //map of yearmonth to transactions
  transactionMonthYears: Map<string, Transaction[]> | null;
};

type allAccData = {
  accounts: Account[] | null;
  //map of account number to map of yearmonth to transactions
  transactionMonthYears: Map<string, Map<string, Transaction[]>> | null;
};

type summaryData = {
  net: number;
  averageDaily: number;
  topThree: string[];
};

export function getCurrentMonthYear(): string {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11, so add 1
  const year = now.getFullYear().toString();

  return `${month}${year}`;
}

export function rollingYears(monthYear: string): number[] {
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

export function getRollingMonthYears(monthYear: string): string[] {
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

function getMonth(monthYear: string): string {
  // Extract the month part from the string (first two characters)
  const monthNumber = parseInt(monthYear.slice(0, 2));

  // Array of month names
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

  // Return the month name corresponding to the month number
  return monthNames[monthNumber - 1];
}

function getYear(monthYear: string): number {
  // Extract the year part from the string (last four characters) and convert to a number
  return parseInt(monthYear.slice(2, 6), 10);
}

function getSummaryAll(data: allAccData): summaryData | null {
  const currMonthYear = getCurrentMonthYear();
  const affectedYears = rollingYears(currMonthYear);
  const affectedMonthYears = getRollingMonthYears(currMonthYear);

  let summary: summaryData = { net: 0, averageDaily: 0, topThree: [] };
  let net = 0;
  let averageSum = 0;
  let averageDivisor = 30;
  let topThree: string[] = [];
  let catMap = new Map<string, number>();

  if (data.accounts && data.transactionMonthYears) {
    for (const account of data.accounts) {
      let lastMonthYear = '';
      for (const monthYear of affectedMonthYears) {
        let yearMonthMap = data.transactionMonthYears.get(account.number);
        if (yearMonthMap) {
          let Transactions = yearMonthMap.get(monthYear);
          if (Transactions) {
            lastMonthYear = monthYear;
          }
        }
      }

      if (lastMonthYear != '') {
        let lastMonthYearTransactions = data.transactionMonthYears
          .get(account.number)
          ?.get(lastMonthYear);

        if (lastMonthYearTransactions) {
          net += lastMonthYearTransactions[0].balance;

          for (const transaction of lastMonthYearTransactions) {
            if (transaction.amount < 0 && transaction.category != 'Transfer') {
              averageSum += Math.abs(transaction.amount);

              if (catMap.get(transaction.category)) {
                let prev = catMap.get(transaction.category) || 0;
                catMap.set(
                  transaction.category,
                  Math.abs(transaction.amount) + prev
                );
              } else {
                catMap.set(transaction.category, Math.abs(transaction.amount));
              }
            }
          }
        }
      }
    }

    let average;
    if (averageDivisor === 0) {
      average = 0;
    } else {
      average = averageSum / averageDivisor;
    }

    topThree = Array.from(catMap.entries()) // Convert map to array of [key, value]
      .sort((a, b) => b[1] - a[1]) // Sort by value in descending order
      .slice(0, 3) // Get top 3 entries
      .map((entry) => entry[0]);

    summary = { net: net, averageDaily: average, topThree: topThree };
    console.log(summary);
    return summary;
  }

  return null;
}

function getSummarySpecific(data: specificAccData): summaryData | null {
  const currMonthYear = getCurrentMonthYear();
  const affectedYears = rollingYears(currMonthYear);
  const affectedMonthYears = getRollingMonthYears(currMonthYear);

  let summary: summaryData = { net: 0, averageDaily: 0, topThree: [] };
  let net = 0;
  let average = 0;
  let topThree: string[] = [];

  return null;
}

const getCategoryStyle = (category: string | undefined) => {
  switch (category) {
    case 'Income':
      return 'bg-[#76EE92]'; // Green for Income
    case 'Transport':
      return 'bg-[#4EB5FF]'; // Blue for Transport
    case 'Eating Out':
      return 'bg-[#FFCD4E]'; // Yellow for Eating Out
    case 'Groceries':
      return 'bg-[#A98DFB]'; // Purple for Groceries
    case 'Entertainment':
      return 'bg-[#FD7575]'; // Red for Entertainment
    case 'Shopping':
      return 'bg-[#FB94F1]'; // Pink for Shopping
    case 'Insurance':
      return 'bg-[#72F1E2]'; // Teal for Insurance
    case 'Utilities':
      return 'bg-[#FDAD73]'; // Orange for Utilities
    case 'Medical Aid':
      return 'bg-[#C1C1C1]'; // Gray for Medical Aid
    case 'Other':
      return 'bg-[#000000] text-white'; // Black for Other
    default:
      return 'bg-white text-black'; // Default style
  }
};

export function OverviewPageRevised(props: OverviewPageRevisedProps) {
  const [selectedAccount, setSelectedAccount] = useState('All Accounts');
  const [allAccountData, setAllAccountData] = useState<allAccData | null>(null);
  const [specificAccountData, setSpecificAccountData] =
    useState<specificAccData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [noAccounts, setNoAccounts] = useState(false);
  const [decisionMade, setDecisionMade] = useState(false);
  const user = useContext(UserContext);
  const router = useRouter();
  let summaryData: summaryData | null = null;

  if (selectedAccount == 'All Accounts' && allAccountData != null) {
    summaryData = getSummaryAll(allAccountData);
  }
  if (selectedAccount != 'All Accounts' && specificAccountData != null) {
    summaryData = getSummarySpecific(specificAccountData);
  }

  useEffect(() => {
    const fetchAllAccounts = async (): Promise<Account[]> => {
      if (!(user && user.uid)) {
        return [];
      }
      const accRef = collection(db, 'accounts');
      const q = query(accRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      let acc: Account[] = [];

      if (querySnapshot.docs.length != 0) {
        setDecisionMade(true);
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

        return acc;
      } else {
        setNoAccounts(true);
        return [];
      }
    };

    const fetchTransactionsAll = async (accounts: Account[]) => {
      if (!(user && user.uid)) {
        return;
      }
      if (accounts.length == 0) {
        setNoAccounts(true);
        return;
      }
      const currMonthYear = getCurrentMonthYear();
      const affectedYears = rollingYears(currMonthYear);
      const affectedMonthYears = getRollingMonthYears(currMonthYear);
      const transactionMonthYears: Map<
        string,
        Map<string, Transaction[]>
      > = new Map();

      for (const year of affectedYears) {
        const accRef = collection(db, `transaction_data_${year}`);
        const q = query(accRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          transactionMonthYears.set(
            data.account_number,
            new Map<string, Transaction[]>()
          );

          for (const monthYear of affectedMonthYears) {
            if (getYear(monthYear) == year) {
              let month = getMonth(monthYear);
              if (data[month]) {
                transactionMonthYears
                  .get(data.account_number)
                  ?.set(monthYear, JSON.parse(data[month]));
              }
            }
          }
        });
      }

      setAllAccountData({
        accounts: accounts,
        transactionMonthYears: transactionMonthYears,
      });
    };

    const fetchTransactionsSpecific = async (account: Account) => {
      let transactionMonthYears = allAccountData?.transactionMonthYears?.get(
        account.number
      );
      if (transactionMonthYears) {
        setSpecificAccountData({
          account: account,
          transactionMonthYears: transactionMonthYears,
        });
      }
    };
    setDataLoading(true);

    if (selectedAccount == 'All Accounts') {
      fetchAllAccounts().then((accounts) => {
        fetchTransactionsAll(accounts).then(() => {
          setDataLoading(false);
        });
      });
    } else {
      if (allAccountData != null) {
        const selectedAccountData = allAccountData?.accounts?.find(
          (account) => account.number === selectedAccount
        );
        if (selectedAccountData) {
          fetchTransactionsSpecific(selectedAccountData).then(() => {
            setDataLoading(false);
          });
        }
      }
    }
  }, [selectedAccount]);

  const handleSelectAccount = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(e.target.value);
  };

  if (noAccounts == true) {
    return (
      <div className="mainPage">
        <div className="w-full text-xl text-center h-full flex flex-col items-center justify-center ">
          <p className="text-gray-500">
            You have not uploaded any transactions. <br />
            <br />
            Head to the accounts section to add a new account.
          </p>
          <button
            onClick={() => {
              router.push('/accounts');
            }}
            className="mt-6 text-lg bg-gray-400 hover:bg-gray-500 shadow-lg transition-all p-3 rounded-xl text-BudgieWhite"
          >
            Take me there
          </button>
        </div>
      </div>
    );
  }

  if (decisionMade) {
    return (
      <>
        {dataLoading && (summaryData == null || false) ? (
          <div className="mainPage">
            {allAccountData != null ? (
              <div className="w-full h-16  shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] rounded-3xl bg-BudgieWhite flex flex-col items-center justify-center">
                <select
                  id="dropdown"
                  value={selectedAccount}
                  onChange={handleSelectAccount}
                  className="text-center rounded-xl shadow-md  border-none text-xl bg-BudgieGrayLight cursor-pointer focus:ring-0"
                >
                  <option key="All Accounts" value="All Accounts">
                    All Accounts
                  </option>
                  {allAccountData?.accounts?.map((account) => (
                    <option key={account.number} value={account.number}>
                      {account.alias}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div
                style={{ animationDuration: '1s' }}
                className="w-full h-16 animate-pulse  shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] rounded-3xl bg-BudgieWhite flex flex-col items-center justify-center"
              ></div>
            )}
            <div className="h-1/2 mt-3 w-full flex items-center justify-center">
              <div
                style={{ animationDuration: '1s' }}
                className="mr-3 animate-pulse shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)]  bg-BudgieWhite rounded-3xl w-[50%] h-full"
              ></div>
              <div
                style={{ animationDuration: '1s' }}
                className="animate-pulse shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-[50%] h-full"
              ></div>
            </div>
            <div
              style={{ animationDuration: '1s' }}
              className="w-full h-1/2 animate-pulse shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl mt-3"
            ></div>
            <div className="h-[40%] mt-3 w-full flex items-center justify-center">
              <div
                style={{ animationDuration: '1s' }}
                className="mr-3 animate-pulse shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-1/3 h-full"
              ></div>
              <div
                style={{ animationDuration: '1s' }}
                className=" animate-pulse shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-2/3 h-full"
              ></div>
            </div>
          </div>
        ) : (
          <div className="mainPage">
            <div className="w-full h-16 rounded-3xl shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] transition-all bg-BudgieWhite flex flex-col items-center justify-center">
              <select
                id="dropdown"
                value={selectedAccount}
                onChange={handleSelectAccount}
                className=" shadow-md text-center rounded-xl font-medium  border-none text-xl bg-BudgieGrayLight cursor-pointer focus:ring-0"
              >
                <option key="All Accounts" value="All Accounts">
                  All Accounts
                </option>
                {allAccountData?.accounts?.map((account) => (
                  <option key={account.number} value={account.number}>
                    {account.alias}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-1/2 mt-3 w-full flex items-center justify-center">
              <div className="p-2 flex flex-col items-center justify-start mr-3 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-[50%] h-full">
                <div className="bg-BudgieGrayLight w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                  <span>Summary</span>
                </div>
                <div className="grow">
                  <div className="flex flex-col items-start h-1/2 justify-around text-3xl font-medium">
                    <div>
                      <span className="mr-5">Net Worth :</span>
                      <span className=" bg-BudgieBlue2 px-3 py-1 rounded-lg text-BudgieWhite">
                        R {summaryData?.net?.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="mr-5">Average Daily Spend :</span>
                      <span className=" bg-BudgieBlue2 px-3 py-1 rounded-lg text-BudgieWhite">
                        R {summaryData?.averageDaily?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className=" flex flex-col items-center justify-around h-1/2 w-full">
                    <span className=" text-3xl font-medium">
                      Top Categories:{' '}
                    </span>
                    <div className="flex items-center justify-around w-full font-medium text-2xl">
                      {summaryData?.topThree.map((category, index) => (
                        <div
                          key={index}
                          className={`p-2 w-[30%] shadow-lg text-center rounded-xl ${getCategoryStyle(
                            category
                          )}`}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-col items-center justify-start shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-[50%] h-full">
                <div className="bg-BudgieGrayLight w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                  <span>Spending by Category</span>
                </div>
              </div>
            </div>
            <div className="w-full h-1/2 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl mt-3"></div>
            <div className="h-[40%] mt-3 w-full flex items-center justify-center">
              <div className="mr-3 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-1/3 h-full"></div>
              <div className="shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-2/3 h-full"></div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default OverviewPageRevised;
