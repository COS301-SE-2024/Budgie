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
      className="h-[25rem]"
      data={props.dataset}
      index="yearmonth"
      categories={['balance']}
      colors={['blue']}
      yAxisWidth={60}
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
      <BalanceChart dataset={dataset}></BalanceChart>
    </div>
  );
}

export default SpecificAccountPage;
