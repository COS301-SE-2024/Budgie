import styles from './overview-page-revised.module.css';
import '../../root.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
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

function getSummaryAll(data: allAccData): pageData | null {
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
  };

  //summary data vars
  let net = 0;
  let averageSum = 0;
  let averageDivisor = 30;
  let topThree: string[] = [];
  let catMap = new Map<string, number>();

  if (data.accounts && data.transactionMonthYears) {
    let i = 0;
    for (const monthYear of affectedMonthYears) {
      incomeExpense.data[i++] = {
        date: getMonthYearString(monthYear),
        Income: 0,
        Expenses: 0,
      };
    }
    for (const account of data.accounts) {
      let lastMonthYear = '';
      for (const monthYear of affectedMonthYears) {
        let yearMonthMap = data.transactionMonthYears.get(account.number);
        if (yearMonthMap) {
          let Transactions = yearMonthMap.get(monthYear);
          if (Transactions) {
            lastMonthYear = monthYear;
            const foundElement = incomeExpense.data.find(
              (item) => item.date === getMonthYearString(monthYear)
            );
            if (foundElement) {
              foundElement.date = getMonthYearString(monthYear);
              foundElement.Income += getIncome(Transactions);
              foundElement.Expenses += getExpenses(Transactions);
            }
          }
        }
      }
      if (lastMonthYear != '') {
        let lastMonthYearTransactions = data.transactionMonthYears
          .get(account.number)
          ?.get(lastMonthYear);

        if (lastMonthYearTransactions) {
          if (latestTransaction.date == '') {
            latestTransaction = lastMonthYearTransactions[0];
          } else {
            const parsedDate1 = new Date(latestTransaction.date);
            const parsedDate2 = new Date(lastMonthYearTransactions[0].date);

            if (parsedDate2 > parsedDate1) {
              latestTransaction = lastMonthYearTransactions[0];
            }
          }
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

              if (transaction.category != 'Income') {
                const categoryCell = pieChart.data.find(
                  (cell) => cell.name === transaction.category
                );
                if (categoryCell) {
                  categoryCell.value = parseFloat(
                    (categoryCell.value + Math.abs(transaction.amount)).toFixed(
                      2
                    )
                  );
                }
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
    pageData = {
      ...pageData,
      pieChart: pieChart,
      summary: summary,
      incomeExpense: incomeExpense,
      latestTransaction: latestTransaction,
    };
    console.log(pageData);
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
      return 'bg-[#C1C1C1]'; // Gray for Medical Aid
    case 'Other':
      return 'bg-[#000000] text-white'; // Black for Other
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
  '#C1C1C1',
  'var(--main-text)',
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

  if (selectedAccount == 'All Accounts' && allAccountData != null) {
    pageData = getSummaryAll(allAccountData);
  }
  if (selectedAccount != 'All Accounts' && specificAccountData != null) {
    pageData = getSummarySpecific(specificAccountData);
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
        {dataLoading || pageData == null ? (
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
            <div className="h-1/2 mt-5 w-full flex items-center justify-center">
              <div className="p-2 flex flex-col items-center justify-start mr-5 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-[50%] h-full">
                <div className="bg-BudgieGrayLight w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                  <span>Summary</span>
                </div>
                <div className="grow">
                  <div className="flex flex-col items-start h-1/2 justify-center text-3xl font-medium">
                    <div>
                      <span className="mr-5">Net Worth :</span>
                      <span className="shadow-md bg-BudgieBlue2 px-3 py-1 rounded-lg text-BudgieWhite">
                        R {pageData?.summary?.net?.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-7">
                      <span className="mr-5">Average Daily Spend :</span>
                      <span className="shadow-md bg-BudgieBlue2 px-3 py-1 rounded-lg text-BudgieWhite">
                        R {pageData?.summary?.averageDaily?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className=" flex flex-col items-center justify-around h-1/2 w-full">
                    <span className=" text-3xl font-medium">
                      Top Categories:{' '}
                    </span>
                    <div className="flex items-center justify-around w-full font-medium text-2xl">
                      {pageData?.summary?.topThree.map((category, index) => (
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
                <div className="grow w-full flex flex-col items-center justify-center">
                  <PieChart width={500} height={270}>
                    <Pie
                      data={pageData.pieChart.data}
                      cx={250}
                      cy={95}
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      className="cursor-pointer border-none"
                    >
                      {pageData.pieChart.data.map((entry, index) => (
                        <Cell
                          className="border-none outline-none ring-0"
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>
            <div className=" p-2 mt-5 w-full h-1/2 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl">
              <div className="bg-BudgieGrayLight w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                <span>Income vs Expenses</span>
              </div>
              <div className="grow flex items-center justify-center">
                <AreaChart
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
            <div className="h-[40%] mt-5 w-full flex items-center justify-center">
              <div className=" p-2 mr-5 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-1/3 h-full">
                <div className="bg-BudgieGrayLight w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                  <span>Latest Transaction</span>
                </div>
                <div className="grow flex items-center justify-center">
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-3xl font-bold mb-4">
                      R {Math.abs(pageData.latestTransaction.amount).toFixed(2)}
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
              <div className=" p-2 shadow-[0px_0px_30px_0px_rgba(0,0,15,0.2)] bg-BudgieWhite rounded-3xl w-2/3 h-full">
                <div className="bg-BudgieGrayLight w-full h-12 rounded-3xl flex items-center justify-center text-lg font-medium">
                  <span>Financial Health Score</span>
                </div>
                <div className="grow flex items-center justify-center"></div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default OverviewPageRevised;
