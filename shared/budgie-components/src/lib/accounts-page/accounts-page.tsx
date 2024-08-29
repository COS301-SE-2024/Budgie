'use client';

import styles from './accounts-page.module.css';
import '../../root.css';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useThemeSettings } from '../../useThemes';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { AreaChart, Color } from '@tremor/react';
import {
  collection,
  DocumentData,
  getDocs,
  query,
  QueryDocumentSnapshot,
  where,
} from 'firebase/firestore';
import { Diversity1 } from '@mui/icons-material';
/* eslint-disable-next-line */
export interface AccountsPageProps {}

//interfaces
interface Account {
  name: string;
  alias: string;
  type: string;
  number: string;
}
interface NoAccountsPageProps {
  onAddClick: () => void;
}

interface AccountUnitProps {
  account: Account;
}

interface Transaction {
  date: string;
  amount: number;
  balance: number;
  description: string;
  category: string;
}

interface GraphSectionProps {
  xAxis: string[];
  yAxis: number[];
}
//helpers

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

export function getCurrentMonthYear(): string {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11, so add 1
  const year = now.getFullYear().toString();

  return `${month}${year}`;
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

export function splitMonthYear(monthYear: string): [string, string] {
  const month = monthYear.slice(0, 2); // Extracts the month (first 2 characters)
  const year = monthYear.slice(2); // Extracts the year (remaining characters)

  return [month, year];
}

export function getMonthName(month: string): string {
  // Array of month names in all lowercase
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

  // Convert month string to number and adjust for 0-based index
  const monthIndex = parseInt(month, 10) - 1;

  // Return the month name from the array, or an empty string if invalid
  return monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : '';
}

export async function getBalancesForMonthYears(
  years: number[],
  rollingMonthYears: string[],
  user: any
): Promise<Record<string, number>> {
  let returnData: Record<string, number> = {};
  console.log(years);
  console.log(rollingMonthYears);
  for (const year of years) {
    const accRef = collection(db, `transaction_data_${year}`);
    const q = query(accRef, where('uid', '==', user.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
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
    });
  }

  for (const monthyear of rollingMonthYears) {
    if (!(monthyear in returnData)) {
      returnData[monthyear] = 0;
    }
  }

  return returnData;
}

export function yearMonthToString(yearMonth: string): string {
  const split = splitMonthYear(yearMonth);
  let name = getMonthName(split[0]);
  name = name.charAt(0).toUpperCase() + name.slice(1);
  const year = split[1];

  return `${name} ${year}`;
}

export const formatTransactionValue = (value: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
};

//---------------------------------
//Components
function NoAccountsPage(props: NoAccountsPageProps) {
  useThemeSettings();
  return (
    <div className="mainPage">
      <div
        className="flex items-center justify-center h-full w-full"
        style={{ backgroundColor: 'var(--main-background)' }}
      >
        <div
          onClick={props.onAddClick}
          className="flex flex-col items-center justify-center bg-BudgieGray hover:bg-black hover:bg-opacity-5 h-80 w-80 border-dashed border-2 border-gray-400 border-opacity-40 hover:border-opacity-100 cursor-pointer  rounded-3xl"
          style={{ backgroundColor: 'var(--main-background)' }}
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

function AccountUnit(props: AccountUnitProps) {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push(`accounts/${props.account.number}`);
      }}
      className="w-[full] cursor-pointer shadow-md min-w-[23rem] max-w-[23rem] m-[1rem] rounded-[2rem] h-[21rem] flex flex-col items-center justify-center bg-BudgieWhite hover:shadow-2xl transition-shadow"
      style={{ backgroundColor: 'var(--block-background)' }}
    >
      {props.account.type == 'current' && (
        <span
          className="text-black material-symbols-outlined"
          style={{
            fontSize: '9rem',
            color: 'var(--main-text)',
          }}
        >
          account_balance
        </span>
      )}
      {props.account.type == 'savings' && (
        <span
          className="text-black material-symbols-outlined"
          style={{
            fontSize: '9rem',
          }}
        >
          savings
        </span>
      )}
      {props.account.type == 'custom' && (
        <span
          className="text-black material-symbols-outlined"
          style={{
            fontSize: '9rem',
          }}
        >
          tune
        </span>
      )}
      <span className="font-TripSans font-medium text-3xl">
        {props.account.alias}
      </span>
      <span className="mt-4 font-TripSans font-medium opacity-25 text-sm">
        {props.account.name}
      </span>
    </div>
  );
}

function AddAccountIcon() {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push('/accounts/new');
      }}
      className="w-[full] cursor-pointer min-w-[23rem] max-w-[23rem] m-[1rem] rounded-[2rem] h-[21rem] flex flex-col items-center justify-center hover:bg-black hover:bg-opacity-5 border-dashed border-2 border-gray-400 border-opacity-40 hover:border-opacity-100"
    >
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
  );
}

function GraphSection(props: GraphSectionProps) {
  let dataset = [];

  for (let i = 0; i < 12; i++) {
    dataset.push({ monthyear: props.xAxis[i], Balance: props.yAxis[i] });
  }
  console.log(dataset);
  return (
    <AreaChart
      className=" w-[90%] h-[85%] "
      data={dataset}
      index="monthyear"
      categories={['Balance']}
      colors={['emerald']}
      yAxisWidth={60}
      showGridLines={false}
      showLegend={true}
      showAnimation={true}
    />
  );
}

function InfoSection(props: GraphSectionProps) {
  let balanceTotal = 0.00;
  let balancePrev = 0;
  let recentMonth = props.xAxis[11];
  for (let i = 0; i < 12; i++) {
    if (props.yAxis[i] != 0) {
      balanceTotal = props.yAxis[i];
      if (i >= 1) {
        balancePrev = props.yAxis[i - 1];
      } else {
        balancePrev = 0;
      }
    }
  }

  function UpOrDown() {
    return (
      <>
        {balancePrev <= balanceTotal && (
          <span
            className="text-BudgieGreen1 material-symbols-outlined"
            style={{
              fontSize: '2rem',
            }}
          >
            north_east
          </span>
        )}
        {balancePrev > balanceTotal && (
          <span
            className="text-red-400 material-symbols-outlined"
            style={{
              fontSize: '2rem',
            }}
          >
            south_east
          </span>
        )}
      </>
    );
  }

  return (
    <>
      <span className="font-TripSans font-bold text-3xl ml-10">
        {recentMonth}
      </span>
      <div className="mr-10 h-full flex flex-col items-start justify-center">
        <div className="flex items-center">
          <span className="font-TripSans font-bold text-3xl">
            Total Balance: R {formatTransactionValue(balanceTotal)}
          </span>
          <UpOrDown></UpOrDown>
        </div>
        <div>
          {props.yAxis[11] == 0 && (
            <>
              <span className="font-TripSans text-gray-400">
                Upload More Financial data to update balance.
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function AccountsPage(props: AccountsPageProps) {
  const [showNoAccounts, setShowNoAccounts] = useState(true);
  const [accountsArray, SetAccountsArray] = useState<Account[]>([]);
  const [graphX, setGraphX] = useState<string[]>([]);
  const [graphY, setGraphY] = useState<number[]>([]);
  useThemeSettings();
  const router = useRouter();
  const user = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      const fetchAccounts = async () => {
        const accRef = collection(db, 'accounts');
        const q = query(accRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        // Do something with querySnapshot
        if (querySnapshot.docs.length == 0) {
          setShowNoAccounts(true);
        } else {
          let acc: Account[] = [];
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
          SetAccountsArray(acc);
          setShowNoAccounts(false);
        }
      };

      const fetchGraphData = async () => {
        const curr = getCurrentMonthYear();
        const affectedYears: number[] = rollingYears(curr);
        const rollingMonthYears: string[] = getRollingMonthYears(curr);

        const data: Record<string, number> = await getBalancesForMonthYears(
          affectedYears,
          rollingMonthYears,
          user
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

      fetchGraphData();
      fetchAccounts();
    };
    fetchData();
  }, []);

  return (
    <>
      {showNoAccounts && (
        <NoAccountsPage
          onAddClick={() => {
            router.push('/accounts/new');
          }}
        ></NoAccountsPage>
      )}
      {!showNoAccounts && (
        <div className="mainPage">
          <div
            className="w-full h-[10%] flex items-center justify-between shadow-md bg-BudgieWhite rounded-[2rem]"
            style={{ backgroundColor: 'var(--block-background)' }}
          >
            <InfoSection xAxis={graphX} yAxis={graphY}></InfoSection>
          </div>
          <div
            className="w-full h-[40%] mt-[1rem] fl shadow-md bg-BudgieWhite rounded-[2rem] flex flex-col items-center justify-center"
            style={{ backgroundColor: 'var(--block-background)' }}
          >
            {graphX.length != 0 && graphY.length != 0 && (
              <GraphSection xAxis={graphX} yAxis={graphY}></GraphSection>
            )}
          </div>
          <div className="w-full grid grid-cols-3">
            {accountsArray.map((account) => (
              <AccountUnit account={account} key={account.number}></AccountUnit>
            ))}
            <AddAccountIcon></AddAccountIcon>
          </div>
        </div>
      )}
    </>
  );
}

export default AccountsPage;
