'use client';
import styles from '../all-transactions-view/AllTransactionsView.module.css';
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import {
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  doc,
} from 'firebase/firestore';
import { useThemeSettings } from '../../useThemes';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { getAuth } from 'firebase/auth';
import '../../root.css';
import { useDataContext } from '../data-context/DataContext';

export interface AllTransactionsViewProps {
  account: string;
  availableYears: number[];
}

export function AllTransactionsView(props: AllTransactionsViewProps) {
  const { data, setData, refreshData } = useDataContext();
  const [balance, setBalance] = useState(0);
  const [moneyIn, setMoneyIn] = useState(0);
  const [moneyOut, setMoneyOut] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [Data, setDisplayData] = useState<any>(null);
  const user = useContext(UserContext);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [LeftArrowStyle, setLeftArrowStyle] = useState('');
  const [RightArrowStyle, setRightArrowStyle] = useState('');
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('');

  useThemeSettings();

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

  const handleNextYear = () => {
    const Now = new Date();
    if (Now.getFullYear() != currentYear) {
      setCurrentYear(currentYear + 1);
      display();
    }
  };

  const handlePrevYear = () => {
    if (currentYear != props.availableYears[0]) {
      setCurrentYear(currentYear - 1);
      display();
    }
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
    if (currentYear == new Date().getFullYear()) {
      setRightArrowStyle('Greyed');
    } else {
      setRightArrowStyle('Normal');
    }

    if (currentYear == data.yearsUploaded[0]) {
      setLeftArrowStyle('Greyed');
    } else {
      setLeftArrowStyle('Normal');
    }
  }, [data.yearsUploaded, currentYear]);

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

  const handleCategoryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    if (user && user.uid) {
      const selectedCategory = event.target.value;
      const transactionMonth =
        parseInt(event.target.id.substring(5, 7), 10) - 1;

      if (selectedCategory === 'Add category') {
        alert('under construction');
      } else {
        const updatedTransactions = transactions.map((transaction, i) =>
          i === index
            ? { ...transaction, category: selectedCategory }
            : transaction
        );

        const filteredTransactions = updatedTransactions.filter(
          (transaction) => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === transactionMonth;
          }
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
            [monthNames[transactionMonth]]:
              JSON.stringify(filteredTransactions),
          });
        }
        setTransactions(updatedTransactions);

        setData({
          ...data,
          transactions: data.transactions.map((transaction) => {
            if (transaction.year === currentYear) {
              return {
                ...transaction,
                [monthNames[transactionMonth]]:
                  JSON.stringify(filteredTransactions),
              };
            }
            return transaction;
          }),
        });
      }
    }
  };

  useEffect(() => {
    const getYearlyTransactions = async () => {
      if (data && data.transactions) {
        try {
          // Filter transactions for the current year and account number
          const filteredTransactions = data.transactions.filter(
            (transaction) => {
              return (
                transaction.account_number == props.account &&
                transaction.year == currentYear
              );
            }
          );

          if (filteredTransactions.length > 0) {
            setDisplayData(filteredTransactions[0]);
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

    getYearlyTransactions();
  }, [currentYear]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = parseInt(event.target.value);
    setCurrentYear(selectedYear);
    setCurrentMonth(new Date(currentMonth.setFullYear(selectedYear)));
    display();
  };

  //CHANGE

  useEffect(() => {
    if (Data !== null) {
      display();
    }
  }, [Data]);

  const display = async () => {
    if (currentYear == new Date().getFullYear()) {
      setRightArrowStyle('Greyed');
    } else {
      setRightArrowStyle('Normal');
    }

    if (currentYear == data.yearsUploaded[0]) {
      setLeftArrowStyle('Greyed');
    } else {
      setLeftArrowStyle('Normal');
    }

    if (Data != null) {
      let transactionsList: any[] = [];
      for (let i = 0; i < 12; i++) {
        if (Data[monthNames[i]]) {
          const addMonth = JSON.parse(Data[monthNames[i]]);
          transactionsList = transactionsList.concat(addMonth);
          setBalance(JSON.parse(Data[monthNames[i]])[0].balance);
        }
      }
      setTransactions(transactionsList);
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
      setMoneyOut(Math.abs(moneyOutTotal)); // moneyOut should be positive for display
    } else {
      setTransactions([]);
      setBalance(0);
      setMoneyIn(0);
      setMoneyOut(0);
    }
  };

  const handleDescriptionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowPopup(true);
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
        update.amount === selectedTransaction.amount &&
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
    updates.push({
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description,
    });

    await updateDoc(doc(db, 'goals', goal.id), {
      updates: JSON.stringify(updates),
      last_update: new Date().toISOString(),
    });

    setData({
      ...data,
      goals: data.goals.map((goalItem) => {
        if (goalItem.name === goal.name) {
          return {
            ...goalItem,
            updates: JSON.stringify(updates),
          };
        }
        return goal;
      }),
    });

    alert('Transaction added to goal.');
    setShowPopup(false);
    setSelectedGoal('Select a Goal');
  };

  return (
    <div className={styles.mainPage}>
      <div className={styles.header}>
        <div className={styles.monthNavigation}>
          <button className={`${getLeftArrowStyle()}`} onClick={handlePrevYear}>
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
          <span className={styles.yearDisplay}>
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
            onClick={handleNextYear}
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
      {balance !== null && (
        <div className={styles.transactionsList}>
          {transactions.length > 0 && (
            <div className={styles.transactions}>
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
                      onChange={(event) => handleCategoryChange(event, index)}
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
        </div>
      )}

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

export default AllTransactionsView;
