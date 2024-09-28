import styles from './overview-page-revised.module.css';
import '../../root.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AreaChart } from '@tremor/react';

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

type CategoryCell = {
  name: string;
  value: number;
};

type pieChartData = {
  data: CategoryCell[];
};

type IncomeExpenseUnitData = {
  date: string;
  Income: number;
  Expenses: number;
};

type IncomeExpensesData = {
  data: IncomeExpenseUnitData[];
};

type pageData = {
  summary: summaryData;
  pieChart: pieChartData;
  incomeExpense: IncomeExpensesData;
  latestTransaction: Transaction;
  latestMonthYear: String;
};

type accountStatus = {
  account: Account;
  last_uploaded: string;
  recent_data: string;
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

function getIncome(transactions: Transaction[]): number {
  let totalIncome = 0;
  for (const transaction of transactions) {
    if (transaction.category == 'Income' && transaction.amount > 0) {
      totalIncome += transaction.amount;
    }
  }

  return parseFloat(totalIncome.toFixed(2));
}

function getExpenses(transactions: Transaction[]): number {
  let totalExpenses = 0;
  for (const transaction of transactions) {
    if (transaction.amount < 0 && transaction.category != 'Transfer') {
      totalExpenses += Math.abs(transaction.amount);
    }
  }

  return parseFloat(totalExpenses.toFixed(2));
}

function getMonthYearString(monthyear: string): string {
  // Check if the input is valid
  if (monthyear.length !== 6) {
    throw new Error('Invalid input format. Expected MMYYYY.');
  }

  // Extract month and year
  const month = parseInt(monthyear.substring(0, 2), 10);
  const year = monthyear.substring(2);

  // Array of month names (index 0 = January, 11 = December)
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Ensure the month is valid
  if (month < 1 || month > 12) {
    throw new Error('Invalid month value.');
  }

  // Return the formatted string
  return `${monthNames[month - 1]} ${year}`;
}

function isLaterMonthYear(current: string, last: string): boolean {
  const currentYear = parseInt(current.slice(2, 6), 10);
  const currentMonth = parseInt(current.slice(0, 2), 10);
  const lastYear = parseInt(last.slice(2, 6), 10);
  const lastMonth = parseInt(last.slice(0, 2), 10);

  if (currentYear > lastYear) {
    return true;
  } else if (currentYear === lastYear && currentMonth > lastMonth) {
    return true;
  } else {
    return false;
  }
}

function getSummaryAll(data: allAccData): pageData | null {
  const currMonthYear = getCurrentMonthYear();
  const affectedMonthYears = getRollingMonthYears(currMonthYear);
  const pieCategories = [
    'Transport',
    'Eating Out',
    'Groceries',
    'Entertainment',
    'Shopping',
    'Insurance',
    'Utilities',
    'Medical Aid',
    'Other',
  ];

  // Initialize pie chart data
  const pieDataInit: CategoryCell[] = pieCategories.map((category) => ({
    name: category,
    value: 0,
  }));

  // Initialize income and expenses data for each month
  const incomeExpenseData: IncomeExpenseUnitData[] = affectedMonthYears.map(
    (monthYear) => ({
      date: getMonthYearString(monthYear),
      Income: 0,
      Expenses: 0,
    })
  );

  let net = 0;
  let averageSum = 0;
  const averageDivisor = 30; // Assuming 30 days in a month
  const catMap = new Map<string, number>();
  let latestTransaction: Transaction | null = null;

  if (data.accounts && data.transactionMonthYears) {
    let lastMonthYear = '000000';

    for (const account of data.accounts) {
      const yearMonthMap = data.transactionMonthYears.get(account.number);
      if (!yearMonthMap) continue;
      //get last months data

      for (const monthYear of affectedMonthYears) {
        const transactions = yearMonthMap.get(monthYear);
        if (!transactions) continue;

        //if at a leter monthyear then set
        if (isLaterMonthYear(monthYear, lastMonthYear)) {
          lastMonthYear = monthYear;
        }
      }
    }

    for (const account of data.accounts) {
      const yearMonthMap = data.transactionMonthYears.get(account.number);
      if (!yearMonthMap) continue;

      //get income vs expenses
      for (const monthYear of affectedMonthYears) {
        const transactions = yearMonthMap.get(monthYear);
        if (!transactions) continue;

        const income = getIncome(transactions);
        const expenses = getExpenses(transactions);

        // Update income and expenses for the month
        const incomeExpenseItem = incomeExpenseData.find(
          (item) => item.date === getMonthYearString(monthYear)
        );
        if (incomeExpenseItem) {
          incomeExpenseItem.Income += income;
          incomeExpenseItem.Expenses += expenses;
        }
      }

      //get summary
      if (lastMonthYear) {
        const lastTransactions = yearMonthMap.get(lastMonthYear);
        if (lastTransactions && lastTransactions.length > 0) {
          const transactionDate = new Date(lastTransactions[0].date);

          // Update latest transaction
          if (
            !latestTransaction ||
            transactionDate > new Date(latestTransaction.date)
          ) {
            latestTransaction = lastTransactions[0];
          }

          net += lastTransactions[0].balance;

          //get pie chart data
          for (const transaction of lastTransactions) {
            if (transaction.amount < 0 && transaction.category != 'Transfer') {
              const amountAbs = Math.abs(transaction.amount);
              averageSum += amountAbs;

              // Update category map for top categories
              catMap.set(
                transaction.category,
                (catMap.get(transaction.category) || 0) + amountAbs
              );

              // Update pie chart data
              if (transaction.category != 'Income') {
                const pieDataItem = pieDataInit.find(
                  (item) => item.name === transaction.category
                );
                if (pieDataItem) {
                  pieDataItem.value = parseFloat(
                    (pieDataItem.value + amountAbs).toFixed(2)
                  );
                }
              }
            }
          }
        }
      }
    }

    const averageDaily = averageDivisor > 0 ? averageSum / averageDivisor : 0;

    // Determine top three spending categories
    const topThree = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    const summary: summaryData = {
      net,
      averageDaily,
      topThree,
    };

    const pieChart: pieChartData = { data: pieDataInit };
    const incomeExpense: IncomeExpensesData = { data: incomeExpenseData };
    const pageData: pageData = {
      summary,
      pieChart,
      incomeExpense,
      latestTransaction: latestTransaction || {
        date: '',
        amount: 0,
        balance: 0,
        description: '',
        category: '',
      },
      latestMonthYear: getMonthYearString(lastMonthYear),
    };

    return pageData;
  }

  return null;
}

function getSummarySpecific(data: specificAccData): pageData | null {
  const currMonthYear = getCurrentMonthYear();
  const affectedYears = rollingYears(currMonthYear);
  const affectedMonthYears = getRollingMonthYears(currMonthYear);
  const pieDataInit = [
    { name: 'Transport', value: 0 },
    { name: 'Eating Out', value: 0 },
    { name: 'Groceries', value: 0 },
    { name: 'Entertainment', value: 0 },
    { name: 'Shopping', value: 0 },
    { name: 'Insurance', value: 0 },
    { name: 'Utilities', value: 0 },
    { name: 'Medical Aid', value: 0 },
    { name: 'Other', value: 0 },
  ];
  let summary: summaryData = { net: 0, averageDaily: 0, topThree: [] };
  let pieChart: pieChartData = { data: pieDataInit };
  let incomeExpense: IncomeExpensesData = { data: [] };
  let latestTransaction: Transaction = {
    date: '',
    amount: 0,
    balance: 0,
    description: '',
    category: '',
  };

  let pageData: pageData = {
    summary: summary,
    pieChart: pieChart,
    incomeExpense: incomeExpense,
    latestTransaction: latestTransaction,
    latestMonthYear: '',
  };

  //summary data vars
  let net = 0;
  let averageSum = 0;
  let averageDivisor = 30;
  let topThree: string[] = [];
  let catMap = new Map<string, number>();

  if (data.account && data.transactionMonthYears) {
    let i = 0;
    for (const monthYear of affectedMonthYears) {
      incomeExpense.data[i++] = {
        date: getMonthYearString(monthYear),
        Income: 0,
        Expenses: 0,
      };
    }

    let lastMonthYear = '';
    for (const monthYear of affectedMonthYears) {
      let transactions = data.transactionMonthYears.get(monthYear);
      if (transactions) {
        lastMonthYear = monthYear;
        const foundElement = incomeExpense.data.find(
          (item) => item.date === getMonthYearString(monthYear)
        );
        if (foundElement) {
          foundElement.date = getMonthYearString(monthYear);
          foundElement.Income += getIncome(transactions);
          foundElement.Expenses += getExpenses(transactions);
        }
      }
    }

    if (lastMonthYear != '') {
      let lastMonthYearTransactions =
        data.transactionMonthYears.get(lastMonthYear);

      if (lastMonthYearTransactions) {
        latestTransaction = lastMonthYearTransactions[0];
        net = lastMonthYearTransactions[0].balance;

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

            if (transaction.category != 'Income') {
              const categoryCell = pieChart.data.find(
                (cell) => cell.name === transaction.category
              );
              if (categoryCell) {
                categoryCell.value = parseFloat(
                  (categoryCell.value + Math.abs(transaction.amount)).toFixed(2)
                );
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

    topThree = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    summary = { net: net, averageDaily: average, topThree: topThree };
    pageData = {
      pieChart: pieChart,
      summary: summary,
      incomeExpense: incomeExpense,
      latestTransaction: latestTransaction,
      latestMonthYear: getMonthYearString(lastMonthYear),
    };

    return pageData;
  }

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
      return 'bg-[#9a9a9a]'; // Gray for Medical Aid
    case 'Other':
      return 'bg-[#d6d6d6] text-black'; // Black for Other
    case 'Transfer':
      return 'bg-black text-white';
    default:
      return 'bg-white text-black'; // Default style
  }
};

const CATEGORY_COLORS = [
  '#4EB5FF',
  '#FFCD4E',
  '#A98DFB',
  '#FD7575',
  '#FB94F1',
  '#72F1E2',
  '#FDAD73',
  '#9a9a9a',
  '#d6d6d6',
];

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
  let pageData: pageData | null = null;
  const globalLatestData = useRef<String | undefined>('');
  const [accountStatuses, setAccountStatuses] = useState<
    accountStatus[] | null
  >(null);

  const [showLegend, setShowLegend] = useState(true);

  if (selectedAccount == 'All Accounts' && allAccountData != null) {
    pageData = getSummaryAll(allAccountData);
    globalLatestData.current = pageData?.latestMonthYear;
  }
  if (selectedAccount != 'All Accounts' && specificAccountData != null) {
    pageData = getSummarySpecific(specificAccountData);
  }

  //legend window even listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setShowLegend(false); // Hide legend on screens smaller than 768px
      } else {
        setShowLegend(true);
      }
    };

    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (allAccountData != null && allAccountData.accounts != null) {
      const getAccountStatus = async (
        accounts: Account[]
      ): Promise<accountStatus[]> => {
        if (accounts && user && allAccountData.transactionMonthYears) {
          const accRef = collection(db, 'upload_dates');
          const q = query(accRef, where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);

          let statuses: accountStatus[] = [];

          for (const account of accounts) {
            let lastUploadedDate = '';
            let lastMonthsData = '011001';

            //determine last uploaded date
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.account_number == account.number) {
                lastUploadedDate = data.date;
              }
            });

            //determine last month with data
            const yearMonthMap = allAccountData.transactionMonthYears.get(
              account.number
            );

            if (yearMonthMap) {
              for (const [monthYear, transactions] of yearMonthMap.entries()) {
                if (isLaterMonthYear(monthYear, lastMonthsData)) {
                  lastMonthsData = monthYear;
                }
              }
            }

            lastMonthsData = getMonthYearString(lastMonthsData);

            //create and push
            let statusObject: accountStatus = {
              account: account,
              last_uploaded: lastUploadedDate,
              recent_data: lastMonthsData,
            };
            statuses.push(statusObject);
          }
          return statuses;
        }
        return [];
      };

      getAccountStatus(allAccountData.accounts).then((statusinfo) => {
        setAccountStatuses(statusinfo);
      });
    }
  }, [allAccountData]);

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

  const handleUploadClick = (accountNumber: string) => {
    router.push('/accounts/' + accountNumber);
  };

  if (noAccounts == true) {
    return (
      <div className="mainPage">
        <div className="w-full text-xl text-center h-full flex flex-col items-center justify-center ">
          <p className="text-gray-500">
            You have not added any accounts to track <br />
            <br />
            Head to the accounts section to add a new account
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

  if (dataLoading) {
    return (
      <div className="mainPage">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="2xl:w-[85%] w-[100%] h-full min-w-60">
            <div
              className="w-full animate-pulse [animation-duration:1s] h-[10%] mt-4 min-h-20 flex items-center justify-between px-6 shadow-md bg-BudgieWhite rounded-[2rem]"
              style={{ backgroundColor: 'var(--block-background)' }}
            ></div>
            <div className="mt-5 w-full flex lg:flex-row flex-col items-center justify-around">
              <div className="p-2 animate-pulse [animation-duration:1s] flex flex-col items-center justify-start shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl lg:w-[30%] w-full lg:aspect-square lg:mt-0 mt-3 min-h-[30vh]"></div>
              <div className="p-2 animate-pulse [animation-duration:1s] flex flex-col items-center justify-start shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl lg:w-[30%] w-full lg:aspect-square lg:mt-0 mt-3 min-h-[30vh]"></div>
              <div className="p-2 animate-pulse [animation-duration:1s] flex flex-col items-center justify-start shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl lg:w-[30%] w-full lg:aspect-square lg:mt-0 mt-3 min-h-[30vh]"></div>
            </div>
            <div className="p-2 animate-pulse [animation-duration:1s] mt-5 w-full h-[40%] min-h-80 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl"></div>
            <div className="p-2 animate-pulse [animation-duration:1s] pb-10 mt-5 w-full min-h-60 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl"></div>
            <div className="w-full h-[10%]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    !(dataLoading || pageData == null) && (
      <div className="mainPage">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="2xl:w-[85%] w-[100%] h-full min-w-60">
            <div
              className="w-full h-[10%] mt-4 min-h-20 flex items-center justify-between px-6 shadow-md bg-BudgieWhite rounded-[2rem]"
              style={{ backgroundColor: 'var(--block-background)' }}
            >
              <span className="font-TripSans font-medium text-sm ">
                Data as of: <br />
                <span className="text-xl font-TripSans font-medium">
                  {pageData.latestMonthYear}
                </span>
              </span>
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
            <div className="mt-5 w-full flex lg:flex-row flex-col items-center justify-around">
              <div className="p-2 flex flex-col items-center justify-start shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl lg:w-[30%] w-full lg:aspect-square lg:mt-0 mt-3 lg:min-h-[30vh]">
                <div className="bg-BudgieBlue2 text-white w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                  <span>Summary</span>
                </div>
                <div className="flex flex-col items-center lg:justify-center grow w-full">
                  <div className="flex flex-col items-center justify-center w-full">
                    <span className="xl:text-2xl md:text-base text-center font-medium lg:mt-2 mt-2">
                      Net Worth:{' '}
                      <span className="shadow-md xl:text-2xl  md:text-base bg-BudgieBlue2 px-2 py-1 rounded-lg text-BudgieWhite">
                        R{pageData?.summary?.net?.toFixed(2)}
                      </span>
                    </span>
                    <span className="xl:text-2xl md:text-base text-center 2xl:mt-6 xl:mt-2 mt-2  font-medium">
                      Average Daily Spend:{' '}
                      <span className="shadow-md xl:text-2xl mt-2 md:text-base bg-BudgieBlue2 px-2 py-1 rounded-lg text-BudgieWhite">
                        R{pageData?.summary?.averageDaily?.toFixed(2)}
                      </span>
                    </span>
                  </div>
                  <div className=" flex flex-col w-full items-center justify-center 2xl:mt-8 xl:mt-8 mt-3">
                    <span className=" 2xl:text-xl md:text-base text-center font-medium">
                      Top Categories:
                    </span>
                    <div className="flex items-center flex-wrap 2xl:mt-6 xl:mt-3 mt-2 justify-around w-full font-medium 2xl:text-lg xl:text-base md:text-base">
                      {pageData?.summary?.topThree.map((category, index) => (
                        <div
                          key={index}
                          className={`p-2 w-fit min-w-[30%] shadow-lg text-center rounded-xl ${getCategoryStyle(
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
              <div className="p-2 flex flex-col items-center justify-start shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl lg:w-[30%] w-full lg:aspect-square lg:mt-0 mt-3 min-h-[30vh]">
                <div className="bg-BudgieBlue2 text-white  w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                  <span>Spending by Category</span>
                </div>
                <div className="grow w-full flex flex-col items-center justify-center">
                  <ResponsiveContainer
                    className=" 2xl:text-sm xl:text-xs lg:text-[0.5rem]"
                    width="100%"
                    height="100%"
                    debounce={1}
                  >
                    <PieChart>
                      <Pie
                        data={pageData.pieChart.data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // outerRadius="100"
                        fill="#8884d8"
                        dataKey="value"
                        className="cursor-pointer border-none"
                      >
                        {pageData.pieChart.data.map((entry, index) => (
                          <Cell
                            className="border-none outline-none ring-0"
                            key={`cell-${index}`}
                            fill={
                              CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      {showLegend && (
                        <Legend
                          layout="horizontal" // Positions legend items horizontally
                          verticalAlign="bottom" // Places the legend at the bottom
                          align="center" // Centers the legend horizontally
                        />
                      )}
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="p-2 flex flex-col items-center justify-start shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl lg:w-[30%] w-full lg:aspect-square lg:mt-0 mt-3 min-h-[30vh]">
                <div className="bg-BudgieBlue2 text-white w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                  <span>Latest Transaction</span>
                </div>
                <div className="grow flex items-center justify-center">
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-3xl font-bold mb-4">
                      R {pageData.latestTransaction.amount.toFixed(2)}
                    </div>
                    <div className="text-xl mb-3 px-4">
                      {pageData.latestTransaction.description}
                    </div>
                    <div
                      className={`text-lg px-4 py-2 rounded-full ${getCategoryStyle(
                        pageData.latestTransaction.category
                      )} mb-3`}
                    >
                      {pageData.latestTransaction.category}
                    </div>
                    <div className="text-md text-gray-600">
                      {new Date(
                        pageData.latestTransaction.date
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2 mt-5 w-full h-[40%] min-h-80 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl">
              <div className="bg-BudgieBlue2 text-white w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                <span>Income vs Expenses</span>
              </div>
              <div className="grow flex items-center justify-center h-[90%]">
                <AreaChart
                  className=" w-[90%] h-[85%] "
                  data={pageData.incomeExpense.data}
                  index="date"
                  categories={['Income', 'Expenses']}
                  colors={['emerald', 'red-400']}
                  showGridLines={false}
                  showLegend={true}
                  showAnimation={true}
                ></AreaChart>
              </div>
            </div>
            <div className="p-2 pb-10 mt-5 w-full min-h-60 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl">
              <div className="bg-BudgieBlue2 text-white w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                <span>Accounts</span>
              </div>
              <div className="grow flex flex-col items-center justify-center">
                {/* Header */}
                <div className="w-full flex mt-4 mb-5 sm:justify-normal justify-around">
                  <span className="w-1/5 xl:text-xl sm:text-base text-xs font-semibold text-center">
                    Account
                  </span>
                  <span className="w-1/5 xl:text-xl sm:text-base text-xs font-semibold text-center sm:inline hidden">
                    Name
                  </span>
                  <span className="w-1/5 xl:text-xl sm:text-base text-xs font-semibold text-center">
                    Last Uploaded
                  </span>
                  <span className="w-1/5 xl:text-xl sm:text-base text-xs font-semibold text-center">
                    Most Recent Data
                  </span>
                  <span className="w-1/5 xl:text-xl sm:text-base text-xs font-semibold text-center">
                    Actions
                  </span>
                </div>
                <div className="grow flex w-full flex-col items-center justify-center space-y-5">
                  {accountStatuses?.map((status) => (
                    <div
                      key={status.account.number}
                      className="w-full flex bg-BudgieGrayLight shadow-md py-2 rounded-2xl items-center sm:justify-normal justify-around"
                    >
                      <span className="w-1/5 xl:text-xl sm:text-base text-xs text-center">
                        {status.account.alias}
                      </span>
                      <span className="w-1/5 xl:text-lg sm:text-base text-xs text-center sm:inline hidden">
                        {status.account.name}
                      </span>
                      <span className="w-1/5 xl:text-xl sm:text-base text-xs text-center">
                        {status.last_uploaded}
                      </span>
                      <span
                        className={`relative w-1/5 xl:text-xl sm:text-base text-xs py-2 text-center rounded-xl ${
                          globalLatestData.current === status.recent_data
                            ? 'bg-green-400 text-BudgieWhite'
                            : 'bg-red-400 text-BudgieWhite'
                        }`}
                      >
                        {/* Conditionally Render the Ping Animation */}
                        {globalLatestData.current != status.recent_data && (
                          <span className="absolute top-[-4px] right-[-4px] flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                          </span>
                        )}

                        {/* Display the Recent Data */}
                        {status.recent_data}
                      </span>
                      <span className="w-1/5 text-center xl:text-xl sm:text-base text-xs flex flex-col items-center justify-start">
                        <button
                          onClick={() => {
                            handleUploadClick(status.account.number);
                          }}
                          className="px-4 py-2 bg-BudgieBlue2 text-white rounded-xl hover:bg-BudgieAccentHover transition-colors"
                        >
                          Upload
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full h-[10%]"></div>
          </div>
        </div>
      </div>
    )
  );
}

export default OverviewPageRevised;
