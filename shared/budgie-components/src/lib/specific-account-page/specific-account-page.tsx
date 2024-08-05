'use client';

import { useEffect } from 'react';
import styles from './specific-account-page.module.css';
import { AreaChart, Color } from '@tremor/react';

/* eslint-disable-next-line */
export interface SpecificAccountPageProps {
  number: string | string[] | undefined;
}

interface BalanceChartProps {
  dataset: {
    yearmonth: string;
    balance: number;
  }[];
}

function BalanceChart(props: BalanceChartProps) {
  return (
    <AreaChart
      className=" w-[90%] h-[23rem] "
      data={props.dataset}
      index="yearmonth"
      categories={['balance']}
      colors={['emerald']}
      yAxisWidth={60}
      showGridLines={false}
      showLegend={false}
      showAnimation={true}
    />
  );
}

interface MonthData {
  date: string;
  amount: number;
  balance: number;
  description: string;
  category: string;
}

export function SpecificAccountPage(props: SpecificAccountPageProps) {
  useEffect(() => {
    const getMonthData = async () => {};
  }, []);

  const YearMonths = [
    'aug 2023',
    'sep 2023',
    'oct 2023',
    'nov 2023',
    'dec 2023',
    'jan 2024',
    'feb 2024',
    'march 2024',
    'april 2024',
    'may 2024',
    'june 2024',
    'july 2024',
  ];

  let dataset = [];

  for (let yearmonth of YearMonths) {
    dataset.push({ yearmonth, balance: 500 });
  }

  return (
    <div className="mainPage">
      <div className="w-full h-2/3 bg-BudgieWhite rounded-3xl flex flex-col items-center justify-center shadow-2xl ">
        <div className="w-full h-28 flex items-start justify-around">
          <div className="flex flex-col items-start justify-start">
            <span className="font-TripSans font-bold text-4xl">
              FNBy Next Transact Account
            </span>
            <span className="font-TripSans text-3xl">July 2024</span>
          </div>
          <div className="flex flex-col items-start justify-start">
            <span className="font-TripSans font-bold text-3xl">
              Total Balance: R1432.00
            </span>
          </div>
        </div>
        <BalanceChart dataset={dataset}></BalanceChart>
      </div>
    </div>
  );
}

export default SpecificAccountPage;
