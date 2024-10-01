'use client';
import styles from '../all-transactions-view/AllTransactionsView.module.css';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import {
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  doc,
} from 'firebase/firestore';
import axios from 'axios';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from 'firebase/auth';
import '../../root.css';
import { useDataContext } from '../data-context/DataContext';

export interface MonthlyTransactionsViewProps {
  account: string;
  availableYears: number[];
}

interface Goal {
  id: string;
  name: string;
  type: string;
  initial_amount?: number;
  current_amount: number;
  target_amount?: number;
  target_date?: string;
  spending_limit?: number;
  updates?: string;
  deleted_updates?: string;
  monthly_updates?: string;
  update_type: string;
  last_update?: string;
  conditions?: string;
}

export function MonthlyTransactionsView(props: MonthlyTransactionsViewProps) {
  const { data, setData } = useDataContext();
  const [balance, setBalance] = useState(0);
  const [moneyIn, setMoneyIn] = useState(1);
  const [moneyOut, setMoneyOut] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [Data, setDisplayData] = useState<any>(null);
  const user = useContext(UserContext);
  const dropdownRef = useRef<HTMLSelectElement>(null);
  const [LeftArrowStyle, setLeftArrowStyle] = useState('');
  const [RightArrowStyle, setRightArrowStyle] = useState('');

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('');

  interface Transaction {
    id: string;
    account_number: string;
    date: string;
    amount: number;
    balance: number;
    description: string;
    category: string;
    year: number;
  }

  const handleNextMonth = () => {
    //change year
    if (currentMonth.getFullYear() != currentYear) {
      setCurrentYear(currentMonth.getFullYear());
    }
    //can't go past current month
    const Now = new Date();
    if (
      currentMonth.getMonth() != Now.getMonth() ||
      currentYear != Now.getFullYear()
    ) {
      //change the month
      setCurrentMonth(
        new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
      );
    }
    display();
  };

  const handlePrevMonth = () => {
    if (
      currentYear == props.availableYears[0] &&
      currentMonth.getMonth() == 0
    ) {
    } else {
      setCurrentMonth(
        new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
      );
      display();
    }
  };

  const handleDescriptionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowPopup(true);
  };

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

  const sendEmail = async (
    UserId: string,
    Email: string,
    thresh: number,
    percentage: number
  ) => {
    try {
      await axios.post(
        'https://us-central1-budgieapp-70251.cloudfunctions.net/sendEmailNotification',
        {
          userId: UserId,
          userEmail: Email,
          threshold: thresh,
          spentPercentage: percentage,
        }
      );
      console.log(`Email sent for over ${percentage}%`);
    } catch (error) {
      console.error('Error sending email:', error);
      const accountKey = `incomeProgress_${props.account}`;
      const storedProgress = JSON.parse(localStorage.getItem(accountKey));
      if (thresh === 25) {
        storedProgress.reached25 = false;
        localStorage.setItem(accountKey, JSON.stringify(storedProgress));
      }
      if (thresh === 50) {
        storedProgress.reached50 = false;
        localStorage.setItem(accountKey, JSON.stringify(storedProgress));
      }
      if (thresh === 75) {
        storedProgress.reached75 = false;
        localStorage.setItem(accountKey, JSON.stringify(storedProgress));
      }
      if (thresh === 100) {
        storedProgress.reached100 = false;
        localStorage.setItem(accountKey, JSON.stringify(storedProgress));
      }
    }
  };

  const handleAddToGoal = async () => {
    if (!selectedGoal || !selectedTransaction) {
      alert('Please select a goal.');
      return;
    }

    const goal = data.goals.find((goal) => goal.id === selectedGoal);
    if (!goal) return;

    const updates = JSON.parse(goal.updates || '[]');

    const existingUpdate = updates.find(
      (update: any) =>
        update.date === selectedTransaction.date &&
        (update.amount === selectedTransaction.amount ||
          update.amount === -selectedTransaction.amount) &&
        update.description === selectedTransaction.description
    );

    if (existingUpdate) {
      if (
        window.confirm(
          'This transaction already exists in the goal. Add it again?'
        )
      ) {
        addUpdateToGoal(goal, selectedTransaction);
      }
    } else {
      addUpdateToGoal(goal, selectedTransaction);
    }
  };

  const addUpdateToGoal = async (goal: Goal, transaction: Transaction) => {
    const updates = JSON.parse(goal.updates || '[]');
    let newAmount;
    if (goal.type === 'Savings') {
      newAmount = transaction.amount;
    } else {
      newAmount = -transaction.amount;
    }
    updates.push({
      date: transaction.date,
      amount: newAmount,
      description: transaction.description,
    });

    await updateDoc(doc(db, 'goals', goal.id), {
      updates: JSON.stringify(updates),
      last_update: new Date().toISOString(),
    });

    setData({
      ...data,
      goals: data.goals.map((goalItem) => {
        if (goalItem.id === goal.id) {
          return {
            ...goalItem,
            updates: JSON.stringify(updates),
          };
        }
        return goalItem;
      }),
    });

    alert('Transaction added to goal.');
    setShowPopup(false);
    setSelectedGoal('Select a Goal');
  };

  const getYearlyTransactions = async () => {
    if (data && data.transactions) {
      try {
        const filteredTransactions = data.transactions.filter((transaction) => {
          return (
            transaction.account_number == props.account &&
            transaction.year == currentYear
          );
        });

        if (filteredTransactions.length > 0) {
          setDisplayData(filteredTransactions[0]);
          display();
        } else {
          console.error(
            'No transactions found for the current year and account'
          );
        }
      } catch (error) {
        console.error('Error processing transactions from context:', error);
      }
    }
  };

  useEffect(() => {
    setCurrentYear(currentMonth.getFullYear()); // Update when currentMonth changes
  }, [currentMonth]);

  useEffect(() => {
    getYearlyTransactions();
    display();
  }, [currentYear, props.account]);

  useEffect(() => {
    if (Data) {
      display();
    }
  }, [Data, currentMonth]);

  const display = async () => {
    if (
      currentMonth.getMonth() == new Date().getMonth() &&
      currentYear == new Date().getFullYear()
    ) {
      setRightArrowStyle('Greyed');
    } else {
      setRightArrowStyle('Normal');
    }

    if (
      currentYear == props.availableYears[0] &&
      currentMonth.getMonth() == 0
    ) {
      setLeftArrowStyle('Greyed');
    } else {
      setLeftArrowStyle('Normal');
    }

    const month = currentMonth
      .toLocaleString('default', { month: 'long' })
      .toLocaleLowerCase();
    if (
      Data && // Ensure Data is not null or undefined
      Data[monthNames[currentMonth.getMonth()]] // Ensure month data exists
    ) {
      const transactionsList = JSON.parse(Data[month]);
      setTransactions(transactionsList);
      setBalance(JSON.parse(Data[month])[0].balance);

      const moneyInTotal = transactionsList
        .filter((transaction: { amount: number }) => transaction.amount > 0)
        .reduce(
          (acc: any, transaction: { amount: any }) => acc + transaction.amount,
          0
        );

      const moneyOutTotal = transactionsList
        .filter((transaction: { amount: number }) => transaction.amount < 0)
        .reduce(
          (acc: any, transaction: { amount: any }) => acc + transaction.amount,
          0
        );

      setMoneyIn(moneyInTotal);
      setMoneyOut(Math.abs(moneyOutTotal)); // money out should be positive for display
      let progressPercentage;
      if (moneyInTotal === 0) {
        progressPercentage = (Math.abs(moneyOutTotal) / 1) * 100;
      } else {
        progressPercentage = (Math.abs(moneyOutTotal) / moneyInTotal) * 100;
      }
      const isSpendingEnabled = localStorage.getItem('spending') === 'true';
      if (isSpendingEnabled) {
        const accountKey = `incomeProgress_${props.account}`;
        const storedProgress = JSON.parse(localStorage.getItem(accountKey)) || {
          reached25: false,
          reached50: false,
          reached75: false,
          reached100: false,
        };
        const user = getAuth().currentUser;
        let userEmail = user?.email;
        if (!userEmail && user.providerData.length > 0) {
          userEmail = user.providerData[0].email;
        }
        if (
          progressPercentage >= 25 &&
          !storedProgress.reached25 &&
          progressPercentage < 50
        ) {
          storedProgress.reached25 = true;
          localStorage.setItem(accountKey, JSON.stringify(storedProgress));
          await sendEmail(user.uid, userEmail, 25, progressPercentage);
        } else if (progressPercentage >= 50 && !storedProgress.reached25) {
          storedProgress.reached25 = true;
          localStorage.setItem(accountKey, JSON.stringify(storedProgress));
        }

        if (
          progressPercentage >= 50 &&
          !storedProgress.reached50 &&
          progressPercentage < 75
        ) {
          storedProgress.reached50 = true;
          localStorage.setItem(accountKey, JSON.stringify(storedProgress));
          console.log('bool: ' + storedProgress);
          console.log('prog: ' + progressPercentage);
          await sendEmail(user.uid, userEmail, 50, progressPercentage);
        } else if (progressPercentage >= 75 && !storedProgress.reached50) {
          storedProgress.reached50 = true;
          localStorage.setItem(accountKey, JSON.stringify(storedProgress));
        }

        if (
          progressPercentage >= 75 &&
          !storedProgress.reached75 &&
          progressPercentage < 100
        ) {
          storedProgress.reached75 = true;
          localStorage.setItem(accountKey, JSON.stringify(storedProgress));
          console.log('bool: ' + storedProgress);
          console.log('prog: ' + progressPercentage);
          await sendEmail(user.uid, userEmail, 75, progressPercentage);
        } else if (progressPercentage >= 100 && !storedProgress.reached75) {
          storedProgress.reached75 = true;
          localStorage.setItem(accountKey, JSON.stringify(storedProgress));
        }
        if (progressPercentage >= 100 && !storedProgress.reached100) {
          storedProgress.reached100 = true;
          localStorage.setItem(accountKey, JSON.stringify(storedProgress));
          console.log('bool: ' + storedProgress);
          console.log('prog: ' + progressPercentage);
          await sendEmail(user.uid, userEmail, 100, progressPercentage);
        }
      }
    } else {
      setTransactions([]);
      setBalance(0);
      setMoneyIn(0);
      setMoneyOut(0);
    }
  };

  const handleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    if (user && user.uid) {
      const selectedCategory = event.target.value;
      if (selectedCategory === 'Add category') {
        alert('under construction');
      } else {
        const updatedTransactions = transactions.map((transaction, i) =>
          i === index
            ? { ...transaction, category: selectedCategory }
            : transaction
        );

        const q = query(
          collection(db, `transaction_data_${currentYear}`),
          where('uid', '==', user.uid),
          where('account_number', '==', props.account)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            [monthNames[currentMonth.getMonth()]]:
              JSON.stringify(updatedTransactions),
          });
        }
        setTransactions(updatedTransactions);

        setData({
          ...data,
          transactions: data.transactions.map((transaction) => {
            if (transaction.year === currentYear) {
              return {
                ...transaction,
                [currentMonth.getMonth()]: JSON.stringify(updatedTransactions),
              };
            }
            return transaction;
          }),
        });
      }
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Income':
        return styles.income;
      case 'Transport':
        return styles.transport;
      case 'Eating Out':
        return styles.eatingOut;
      case 'Groceries':
        return styles.groceries;
      case 'Entertainment':
        return styles.entertainment;
      case 'Shopping':
        return styles.shopping;
      case 'Insurance':
        return styles.insurance;
      case 'Utilities':
        return styles.utilities;
      case 'Medical Aid':
        return styles.medicalAid;
      case 'Other':
        return styles.other;
      case 'Transfer':
        return styles.transfer;
      default:
        return styles.default;
    }
  };

  const getLeftArrowStyle = () => {
    switch (LeftArrowStyle) {
      case 'Normal':
        return styles.leftNavButton;
      case 'Greyed':
        return styles.greyedleftNavButton;
      default:
        return styles.leftNavButton;
    }
  };

  const getRightArrowStyle = () => {
    switch (RightArrowStyle) {
      case 'Normal':
        return styles.rightNavButton;
      case 'Greyed':
        return styles.greyedrightNavButton;
      default:
        return styles.rightNavButton;
    }
  };

  const formatCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  };

  const formatTransactionValue = (value: number) => {
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: 'decimal',
      minimumFractionDigits: 2,
    });
    return formatter.format(value);
  };

  const monthOptions = [
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

  useEffect(() => {
    if (dropdownRef.current) {
      const selectedOption =
        dropdownRef.current.options[dropdownRef.current.selectedIndex];
      const size = getMonthWidth(selectedOption.text);
      dropdownRef.current.style.width = `${size + 12}px`;
    }
  }, [currentMonth]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = event.target.value;
    const monthIndex = monthOptions.indexOf(selectedMonth);
    setCurrentMonth(new Date(currentMonth.setMonth(monthIndex)));
    display();
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = parseInt(event.target.value);
    const updatedDate = new Date(currentMonth.setFullYear(selectedYear));
    setCurrentYear(selectedYear);
    setCurrentMonth(updatedDate);
    display();
  };

  function getMonthWidth(
    text: string,
    font: string = 'calc(1.4rem * var(--font-size-multiplier)) Trip Sans'
  ): number {
    const span = document.createElement('span');
    span.style.font = font;
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'nowrap';
    span.textContent = text;
    document.body.appendChild(span);
    const width: number = span.offsetWidth;
    document.body.removeChild(span);
    return width;
  }

  return (
    <div className="w-full bg-[var(--main-background)] !z-0">
      <div className="flex justify-between items-center !z-0 !sticky !top-12  bg-BudgieAccentHover py-2 px-4 shadow-md  rounded-b-2xl">
        <div className="flex items-center">
          <button
            className={`${getLeftArrowStyle()}`}
            onClick={handlePrevMonth}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 'calc(1.4rem * var(--font-size-multiplier))',
                alignContent: 'center',
                display: 'flex',
              }}
            >
              arrow_back_ios
            </span>
          </button>
          <span className={styles.monthDisplay}>
            <select
              ref={dropdownRef}
              className={styles.dateDropdown}
              value={monthOptions[currentMonth.getMonth()]}
              onChange={handleMonthChange}
            >
              {monthOptions.map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              className={styles.dateDropdown}
              value={currentYear}
              onChange={handleYearChange}
            >
              {props.availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </span>
          <button
            className={`${getRightArrowStyle()}`}
            onClick={handleNextMonth}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 'calc(1.4rem * var(--font-size-multiplier))',
                alignContent: 'center',
                display: 'flex',
              }}
            >
              arrow_forward_ios
            </span>
          </button>
        </div>
        <div className="font-bold text-2xl flex text-BudgieWhite justify-center items-center">
          Balance: {formatCurrency(balance)}
          <div className="ml-8">
            <p className="text-green-300 font-bold text-base">
              Money In: {formatCurrency(moneyIn)}
            </p>
            <p className="text-red-300 font-bold text-base">
              Money Out: {formatCurrency(moneyOut)}
            </p>
          </div>
        </div>
      </div>
      {moneyIn === 0 && moneyOut === 0 ? (
        <div className={styles.noTransactionsMessage}>
          There are no transactions to display for this month.
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center">
          <div className="text-black flex w-[98%] flex-col items-center justify-center gap-[10px] mt-4">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className={styles.transactionCard}
                style={{
                  borderLeft:
                    transaction.amount >= 0
                      ? '15px solid #8EE5A2'
                      : '15px solid var(--primary-1)',
                }}
              >
                <div className={styles.transactionContent}>
                  <div className={styles.transactionDate}>
                    {transaction.date}
                  </div>
                  <div
                    className={styles.transactionDescription}
                    onClick={() => handleDescriptionClick(transaction)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {transaction.description}
                  </div>
                  <div className={styles.transactionAmount}>
                    {formatTransactionValue(transaction.amount)}
                  </div>
                  <select
                    className={`${styles.categoryDropdown} ${getCategoryStyle(
                      transaction.category
                    )}`}
                    data-testid="category-dropdown-income"
                    onChange={(event) => handleChange(event, index)}
                    id={`${transaction.date}-${transaction.description}`}
                    value={transaction.category}
                  >
                    <option value=""></option>
                    <option value="Income">Income</option>
                    <option value="Transport">Transport</option>
                    <option value="Eating Out">Eating Out</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Medical Aid">Medical Aid</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div></div>

      {showPopup && selectedTransaction && (
        <div className="fixed top-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50000 w-[85vw] text-sm md:text-lg lg:text-xl">
          <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-full max-w-lg ">
            <div className="mb-4">
              <p
                className="font-semibold"
                style={{
                  fontSize: 'calc(1.2rem * var(--font-size-multiplier))',
                }}
              >
                Transaction Details
              </p>
            </div>
            <div
              className="flex flex-col items-center"
              style={{ fontSize: 'calc(1rem * var(--font-size-multiplier))' }}
            >
              <div className="flex justify-between w-[50%]">
                <div className="font-semibold">Date:</div>
                <div>{selectedTransaction.date}</div>
              </div>

              <div className="flex justify-between w-[50%]">
                <div className="font-semibold">Description:</div>
                <div>{selectedTransaction.description}</div>
              </div>

              <div className="flex justify-between w-[50%]">
                <div className="font-semibold">Amount:</div>
                <div>{formatTransactionValue(selectedTransaction.amount)}</div>
              </div>
            </div>

            {data.goals.length > 0 && (
              <div className="mt-6">
                <div
                  className="mb-2 font-semibold"
                  style={{
                    fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  }}
                >
                  Add to a Goal:
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                  >
                    <option value="">Select a Goal</option>
                    {data.goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAddToGoal()}
                    className="text-[var(--primary-1)] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <button
              className="mt-8 bg-[var(--primary-1)] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyTransactionsView;
