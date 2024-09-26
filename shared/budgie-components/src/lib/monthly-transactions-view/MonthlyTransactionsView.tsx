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
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from 'firebase/auth';
import '../../root.css';

export interface MonthlyTransactionsViewProps {
  account: string;
  data: any;
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
  const [balance, setBalance] = useState(0);
  const [moneyIn, setMoneyIn] = useState(1);
  const [moneyOut, setMoneyOut] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [Data, setData] = useState<any>(null);
  const user = useContext(UserContext);
  const dropdownRef = useRef<HTMLSelectElement>(null);
  const [LeftArrowStyle, setLeftArrowStyle] = useState('');
  const [RightArrowStyle, setRightArrowStyle] = useState('');

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [userGoals, setUserGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('');


  interface Transaction {
    date: string;
    amount: number;
    balance: number;
    description: string;
    category: string;
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
      if (currentMonth.getFullYear() != currentYear) {
        setCurrentYear(currentMonth.getFullYear());
      }
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


  useEffect(() => {
    const fetchUserGoals = async () => {
      if (user && user.uid) {
        const q = query(collection(db, 'goals'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const goalsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Goal[];
        setUserGoals(goalsList);
      }
    };

    fetchUserGoals();
  }, [user]);

  const handleAddToGoal = async () => {
    if (!selectedGoal || !selectedTransaction) {
      alert('Please select a goal.');
      return;
    }

    const goal = userGoals.find((goal) => goal.id === selectedGoal);
    if (!goal || !goal.updates) return;

    const updates = JSON.parse(goal.updates || '[]');

    const existingUpdate = updates.find(
      (update: any) =>
        update.date === selectedTransaction.date &&
        update.amount === selectedTransaction.amount &&
        update.description === selectedTransaction.description
    );

    if (existingUpdate) {
      if (window.confirm('This transaction already exists in the goal. Add it again?')) {
        addUpdateToGoal(goal, selectedTransaction);
      }
    } else {
      addUpdateToGoal(goal, selectedTransaction);
    }
  };

  const addUpdateToGoal = async (goal: Goal, transaction: Transaction) => {
    const updates = JSON.parse(goal.updates || '[]');
    updates.push({
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description,
    });

    await updateDoc(doc(db, 'goals', goal.id), {
      updates: JSON.stringify(updates),
    });

    alert('Transaction added to goal.');
    setShowPopup(false);
    setSelectedGoal("Select a Goal")
  };

  useEffect(() => {
    const getYearlyTransactions = async () => {
      if (user && user.uid) {
        try {
          const q = query(
            collection(db, `transaction_data_${currentYear}`),
            where('uid', '==', user.uid),
            where('account_number', '==', props.account)
          );
          const querySnapshot = await getDocs(q);
          const transactionList = querySnapshot.docs.map((doc) => doc.data());
          setData(transactionList[0]);
        } catch (error) {
          console.error('Error getting bank statement document:', error);
        }
      }
    };


    const auth = getAuth();
    if (auth) {
      const user = auth.currentUser;
      if (user !== null) {
        getYearlyTransactions();
      }
    }
  }, [currentYear]);

  useEffect(() => {
    if (Data !== null) {
      display();
    }
  }, [Data]);

  useEffect(() => {
    setData(props.data);
  }, []);

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
      Data === undefined ||
      Data[month] === undefined ||
      Data[month] === null
    ) {
      setTransactions([]);
      setBalance(0);
      setMoneyIn(0);
      setMoneyOut(0);
    } else {
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

          const querySnapshot2 = await getDocs(q);
          const transactionList = querySnapshot2.docs.map((doc) => doc.data());
          setData(transactionList[0]);
        }
        setTransactions(updatedTransactions);
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
    setCurrentYear(selectedYear);
    setCurrentMonth(new Date(currentMonth.setFullYear(selectedYear)));
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
    <div className={styles.mainPage}>
      <div className={styles.header}>
        <div className={styles.monthNavigation}>
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
        <div className={styles.balanceInfo}>
          Balance: {formatCurrency(balance)}
          <p className={styles.moneyInfo}>
            Money In: {formatCurrency(moneyIn)}
          </p>
          <p className={styles.moneyInfo}>
            Money Out: {formatCurrency(moneyOut)}
          </p>
        </div>
      </div>
<br />
      <div className={styles.transactionsList}>
        {moneyIn === 0 && moneyOut === 0 ? (
          <div className={styles.noTransactionsMessage}>
            There are no transactions to display for this month.
          </div>
        ) : (
          <div className={styles.transactions}>
            
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className={styles.transactionCard}
                style={{
                  borderLeft: transaction.amount >= 0 ? '15px solid #8EE5A2' : '15px solid var(--primary-1)',
                }}
              >
                <div className={styles.transactionContent}>
                  <div className={styles.transactionDate}>{transaction.date}</div>
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
        )}
        <div>

        </div>
      </div>
      {showPopup && selectedTransaction && (
        <div className="fixed top-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50000 w-[85vw] text-sm md:text-lg lg:text-xl">

          <div className="bg-[var(--block-background)] p-5 rounded text-center z-2 w-full max-w-lg ">

            <div className="mb-4">
              <p className="font-semibold" style={{fontSize:'calc(1.2rem * var(--font-size-multiplier))'}}>Transaction Details</p>
            </div>
            <div className="flex flex-col items-center" style={{fontSize:'calc(1rem * var(--font-size-multiplier))'}}>
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

            {userGoals.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 font-semibold" style={{fontSize:'calc(1rem * var(--font-size-multiplier))'}}>Add to a Goal:</div>
                <div className="flex items-center space-x-2">
                  <select
                    className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                  >
                    <option value="">Select a Goal</option>
                    {userGoals.map((goal) => (
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
