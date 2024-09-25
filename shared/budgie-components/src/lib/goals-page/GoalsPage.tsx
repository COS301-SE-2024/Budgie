'use client';

import React, { useEffect, useState, useContext } from 'react';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Label,
  CartesianGrid,
} from 'recharts';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import AddGoalPopup from '../add-goal-popup/AddGoalPopup';
import EditGoalPopup from '../edit-goal-popup/EditGoalPopup';
import styles from './GoalsPage.module.css';
import UpdateGoalPopup from '../update-goal-progress-popup/UpdateGoalProgressPopup';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import '../../root.css';

import Image from 'next/image';

import gif1 from '../../../public/images/birdgif1.gif';
import gif2 from '../../../public/images/birdgif2.gif';
import gif3 from '../../../public/images/birdgif3.gif';
import gif4 from '../../../public/images/birdgif4.gif';
import gif5 from '../../../public/images/birdgif5.gif';
import gif6 from '../../../public/images/birdgif6.gif';

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
  accounts: ([]);
  description?: string[];
  last_update?: string;
  category?: string;
}

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

interface Update {
  amount: number;
  date: string;
  description?: string;
  category?: string;
}

export interface TableProps {
  goal: Goal;
}

const UpdateTable = ({ goal, onUpdateGoal }: TableProps & { onUpdateGoal: (goal: Goal) => void }) => {
  const [localUpdates, setLocalUpdates] = useState<Update[]>(goal.updates ? JSON.parse(goal.updates) : []);

  const handleDeleteUpdate = (amount: number, date: string) => {

    if (window.confirm("Do you really want to delete this update?") && goal.updates) {
      let updatedCurrentAmount = goal.current_amount;

      if (goal.type === "Debt Reduction") {
        updatedCurrentAmount += amount;
      } else {
        updatedCurrentAmount -= amount;
      }

      let removed = false;
      const newUpdates: Update[] = [];
      for (let i = 0; i < localUpdates.length; i++) {
        const update = localUpdates[i];
        if (!removed && update.amount === amount && update.date === date) {
          removed = true;
          continue;
        }
        newUpdates.push(update);
      }

      goal.current_amount = updatedCurrentAmount;
      goal.updates = JSON.stringify(newUpdates);

      let monthlyUpdatesArray = goal.monthly_updates ? JSON.parse(goal.monthly_updates) : [];
      const updateMonth = new Date(date).toLocaleString("default", { month: "long", year: "numeric" });
      const monthlyUpdateIndex = monthlyUpdatesArray.findIndex(
        (entry: { month: string }) => entry.month === updateMonth
      );

      if (monthlyUpdateIndex >= 0) {
        monthlyUpdatesArray[monthlyUpdateIndex].amount -= amount;
        if (monthlyUpdatesArray[monthlyUpdateIndex].amount == 0) {
          monthlyUpdatesArray.splice(monthlyUpdateIndex, 1);
        }
      }

      goal.monthly_updates = JSON.stringify(monthlyUpdatesArray);

      setLocalUpdates(newUpdates);
      onUpdateGoal(goal);
      updateDB();
    }
  };

  const updateDB = async () => {
    try {
      const goalData: any = {
        updates: goal.updates,
        current_amount: goal.current_amount,
        monthly_updates: goal.monthly_updates,
      };

      const goalDocRef = doc(db, "goals", goal.id);
      await updateDoc(goalDocRef, goalData);
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleDeleteNonManualUpdate = (amount: number, date: string, description: string) => {
    if (window.confirm("Do you really want to delete this update? The transaction cannot be added back to this goal.") && goal.updates) {
      let updatedCurrentAmount = goal.current_amount;
      const newUpdates: Update[] = [];
      const deletedUpdates: Update[] = goal.deleted_updates ? JSON.parse(goal.deleted_updates) : [];

      // Adjust current amount
      if (goal.type === "Debt Reduction") {
        updatedCurrentAmount += amount;  // Add back the amount for debt reduction
      } else {
        updatedCurrentAmount -= amount;  // Subtract the amount for other types
      }

      // Filter out the update being deleted and move it to deleted_updates
      let removed = false;
      for (let i = 0; i < localUpdates.length; i++) {
        const update = localUpdates[i];
        if (!removed && update.amount === amount && update.date === date && update.description === description) {
          deletedUpdates.push(update);  // Move to deleted_updates
          continue;
        }
        newUpdates.push(update);  // Keep remaining updates
      }

      // Update the monthly_updates array
      let monthlyUpdatesArray = goal.monthly_updates ? JSON.parse(goal.monthly_updates) : [];
      const updateMonth = new Date(date).toLocaleString("default", { month: "long", year: "numeric" });
      const monthlyUpdateIndex = monthlyUpdatesArray.findIndex(
        (entry: { month: string }) => entry.month === updateMonth
      );

      if (monthlyUpdateIndex >= 0) {
        monthlyUpdatesArray[monthlyUpdateIndex].amount -= amount;  // Adjust the monthly total
        if (monthlyUpdatesArray[monthlyUpdateIndex].amount == 0) {
          monthlyUpdatesArray.splice(monthlyUpdateIndex, 1);  // Remove month if total is 0
        }
      }

      // Update goal's fields
      goal.current_amount = updatedCurrentAmount;
      goal.updates = JSON.stringify(newUpdates);
      goal.deleted_updates = JSON.stringify(deletedUpdates);
      goal.monthly_updates = JSON.stringify(monthlyUpdatesArray);

      // Update local state and Firestore
      setLocalUpdates(newUpdates);
      onUpdateGoal(goal);
      updateDBNonManual();
    }
  };


  const updateDBNonManual = async () => {
    try {
      const goalData: any = {
        updates: goal.updates,
        deleted_updates: goal.deleted_updates, // Save deleted updates to Firestore
        current_amount: goal.current_amount,
        monthly_updates: goal.monthly_updates,
      };

      const goalDocRef = doc(db, "goals", goal.id);
      await updateDoc(goalDocRef, goalData);
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  useEffect(() => {
    if (goal.updates) {
      try {
        const parsedUpdates = JSON.parse(goal.updates);
        setLocalUpdates(parsedUpdates);
      } catch (error) {
        console.error("Failed to parse updates", error);
      }
    }
    updateDB();
  }, [goal.updates, goal.current_amount]);

  return (
    <>
      {goal.update_type == 'manual' && (
        <div>
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr style={{ color: 'var(--secondary-text)', backgroundColor: 'var(--primary-1)' }}>
                <th className="border border-gray-200 p-2 text-left" style={{ width: '1%', backgroundColor: 'var(--block-background)', border: '1px solid var(--block-background)' }}></th> {/* Empty header with fixed width */}
                <th className="border border-gray-200 p-2 text-left">Amount</th>
                <th className="border border-gray-200 p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {localUpdates.map((update: { amount: number; date: string; }, index: number) => (
                <tr key={index}>
                  <td className='border border-gray-200 p-2 text-center' style={{ width: '1%', borderLeft: '1px solid var(--block-background)', borderBottom: '1px solid var(--block-background)' }}>
                    <span
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => handleDeleteUpdate(update.amount, update.date)}
                    >
                      &#x2716;
                    </span>
                  </td>
                  <td className='border border-gray-200 p-2' >R {update.amount.toFixed(2)}</td>
                  <td className='border border-gray-200 p-2'>{update.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {goal.update_type != 'manual' && (
        <div>
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr style={{ color: 'var(--secondary-text)', backgroundColor: 'var(--primary-1)' }}>
                <th className="border border-gray-200 p-2 text-left" style={{ width: '1%', backgroundColor: 'var(--block-background)', border: '1px solid var(--block-background)' }}></th> {/* Empty header with fixed width */}
                <th className="border border-gray-200 p-2 text-left">Amount</th>
                <th className="border border-gray-200 p-2 text-left">Date</th>
                <th className="border border-gray-200 p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {localUpdates.map((update: Update, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-200 p-2 text-center" style={{ width: '1%', borderLeft: '1px solid var(--block-background)', borderBottom: '1px solid var(--block-background)' }}>
                    <span
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => handleDeleteNonManualUpdate(update.amount, update.date, update.description || '')}
                    >
                      &#x2716;
                    </span>
                  </td>
                  <td className="border border-gray-200 p-2">R {update.amount.toFixed(2)}</td>
                  <td className="border border-gray-200 p-2">{update.date}</td>
                  <td className="border border-gray-200 p-2">{update.description || 'No description'}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </>
  );
};

export interface GoalInfoPageProps {
  goal: Goal;
  onClose: () => void;
}

const GoalInfoPage = ({ goal, onClose, onUpdateGoal }: GoalInfoPageProps & { onUpdateGoal: (goal: Goal) => void }) => {
  const now = new Date();
  const [updatePopupOpen, setUpdatePopupOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(goal);
  const user = useContext(UserContext);

  const handleGoalUpdate = (updatedGoal: Goal) => {
    setCurrentGoal({ ...updatedGoal });
    onUpdateGoal(updatedGoal);
  };

  const handleUpdateGoalPopup = () => {
    setUpdatePopupOpen(!updatePopupOpen);
  };

  const [editPopupOpen, setEditPopupOpen] = useState(false);

  const handleEditGoalPopup = () => {
    setEditPopupOpen(!editPopupOpen);
  };

  const monthlyBudgetSpent = (goal: Goal): number => {
    if (goal.monthly_updates !== undefined) {
      const data = JSON.parse(goal.monthly_updates);
      const currentMonthYear = `${monthNames[new Date().getMonth()]
        } ${new Date().getFullYear()}`;
      const currentMonthData = data.find(
        (item: { month: string }) => item.month === currentMonthYear
      );
      const amountForCurrentMonth = currentMonthData
        ? currentMonthData.amount
        : 0;
      return amountForCurrentMonth;
    }
    return 0;
  };

  const calculateProgressPercentage = (goal: Goal): number => {

    //debt
    if (goal.current_amount !== undefined && goal.initial_amount !== undefined) {
      if (goal.initial_amount) {
        return Math.min(
          100,
          ((goal.initial_amount - goal.current_amount) /
            (goal.initial_amount)) * 100
        );
      } else {
        return Math.min(100, (goal.current_amount) * 100);
      }
    }

    //savings
    if (goal.current_amount !== undefined && goal.target_amount !== undefined) {
      return Math.min(
        100,
        -(((goal.current_amount) /
          (goal.target_amount)) * 100)
      );

    }

    //limits
    if (
      goal.spending_limit !== undefined &&
      goal.monthly_updates !== undefined
    ) {
      const amountForCurrentMonth = monthlyBudgetSpent(goal);
      return (amountForCurrentMonth / goal.spending_limit) * 100;
    }
    return 0;
  };

  const calculateDaysLeft = (targetDate: string): number => {
    const currentDate = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getGif = (progress: number) => {
    if (progress <= 15) return gif1;
    if (progress <= 40) return gif2;
    if (progress <= 60) return gif3;
    if (progress <= 80) return gif4;
    if (progress < 100) return gif5;
    return gif6;
  };

  const getColorForValue = (value: number, type: string): string => {
    if (value < 100) return 'var(--primary-1)';
    if (type == 'Spending Limit' && value >= 100) return '#FF0000';
    return '#46981d';
  };

  interface GoalMonthlyUpdate {
    amount: number;
    month: string;
  }

  const getUpdates = () => {
    if (goal.monthly_updates) {
      const updatesData = JSON.parse(goal.monthly_updates);

      updatesData.sort((a: { month: string }, b: { month: string }) => {
        return new Date(a.month).getTime() - new Date(b.month).getTime();
      });

      return updatesData.map((update: { month: string; amount: number }) => ({
        month: update.month,
        amount: update.amount.toFixed(2),
      }));
    }
    return [];
  };


  const getBudgetUpdates = () => {
    if (goal.monthly_updates) {
      const updatesData: GoalMonthlyUpdate[] = JSON.parse(goal.monthly_updates);

      const parseMonth = (monthStr: string): Date => {
        return new Date(`1 ${monthStr}`);
      };

      const spendingLimit = goal.spending_limit || Infinity;

      const formattedData = updatesData
        .map((update) => {
          const amount = update.amount;
          const excess = amount > spendingLimit ? amount - spendingLimit : 0;
          const amountWithinLimit =
            amount > spendingLimit ? spendingLimit : amount;

          return {
            month: update.month,
            amount: amountWithinLimit,
            excess,
            date: parseMonth(update.month),
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(({ date, excess, ...rest }) => ({
          ...rest,
          excess,
        }));

      return formattedData;
    }
  };

  const getAccountNumbersForGoal = async (): Promise<string[]> => {
    if (user && user.uid) {
      const accountNumbers: string[] = [];
      const goalAccounts = goal.accounts;  // Goal's account aliases

      if (!goalAccounts || goalAccounts.length === 0) return accountNumbers;

      try {
        const accountsCollectionRef = collection(db, "accounts");
        const q = query(accountsCollectionRef, where("uid", "==", user.uid), where("alias", "in", goalAccounts));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.account_number) {
            accountNumbers.push(data.account_number);
          }
        });
      } catch (error) {
        console.error("Error getting account numbers for goal:", error);
      }

      return accountNumbers;
    }
    return [];
  };

  const getMatchingTransactions = async (accountNumbers: string[], keywords: string[]): Promise<any[]> => {
    if (user && user.uid) {
      let transactionsList: any[] = [];
      const years = ["transaction_data_2024", "transaction_data_2023"];

      try {
        for (let year of years) {
          for (let accountNumber of accountNumbers) {
            const q = query(
              collection(db, year),
              where("account_number", "==", accountNumber),
              where("uid", "==", user.uid)
            );

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              const docData = doc.data();
              const months = [
                "january", "february", "march", "april", "may", "june",
                "july", "august", "september", "october", "november", "december"
              ];

              months.forEach((month) => {
                if (docData[month]) {
                  const transactions = JSON.parse(docData[month]);

                  // Filter transactions by keywords in the description
                  const filteredTransactions = transactions.filter((transaction: { description: string }) =>
                    keywords.some((keyword) =>
                      transaction.description.toLowerCase().includes(keyword.toLowerCase())
                    )
                  );

                  transactionsList = transactionsList.concat(filteredTransactions);
                }
              });
            });
          }
        }
      } catch (error) {
        console.error("Error fetching transactions: ", error);
      }

      return transactionsList;
    }
    return [];
  };

  const getMatchingTransactionsByCategory = async (accountNumbers: string[], categories: string[]): Promise<any[]> => {
    if (user && user.uid) {
      let transactionsList: any[] = [];
      const years = ["transaction_data_2024", "transaction_data_2023"]; // Add more years as needed
  
      try {
        for (let year of years) {
          for (let accountNumber of accountNumbers) {
            // Query the collection for documents that match the given account number and uid
            const q = query(
              collection(db, year),
              where("account_number", "==", accountNumber),
              where("uid", "==", user.uid)
            );
  
            // Get documents from the query
            const querySnapshot = await getDocs(q);
  
            // Loop through each document
            querySnapshot.forEach((doc) => {
              const docData = doc.data();
  
              // List of months to check for transactions (e.g., "january", "february", etc.)
              const months = [
                "january", "february", "march", "april", "may", "june",
                "july", "august", "september", "october", "november", "december"
              ];
  
              // Check each month for transactions
              months.forEach((month) => {
                if (docData[month]) {
                  // Parse the JSON string of transactions
                  const transactions = JSON.parse(docData[month]);
  
                  // Filter transactions by the category
                  const filteredTransactions = transactions.map((transaction: { category: string; amount: number }) => {
                    // Ensure the amount is stored as a positive number
                    return {
                      ...transaction,
                      amount: Math.abs(transaction.amount), // Convert amount to positive
                    };
                  }).filter((transaction: { category: string; }) =>
                    categories.includes(transaction.category)
                  );
  
                  // Add filtered transactions to the list
                  transactionsList = transactionsList.concat(filteredTransactions);
                }
              });
            });
          }
        }
      } catch (error) {
        console.error("Error fetching transactions by category: ", error);
      }
  
      return transactionsList;
    }
    return [];
  };
  


  const aggregateMonthlyUpdates = (transactions: any[]): { amount: number; month: string }[] => {
    const monthlySums: { [key: string]: number } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (!monthlySums[monthYear]) {
        monthlySums[monthYear] = 0;
      }

      monthlySums[monthYear] += transaction.amount;
    });

    // Convert the monthlySums object to an array in the required format
    return Object.entries(monthlySums).map(([month, amount]) => ({
      amount: parseFloat(amount.toFixed(2)),  // Ensures two decimal points
      month,
    }));
  };

  const handleDescriptionUpdateClick = async () => {
    try {
      const accountNumbers = await getAccountNumbersForGoal();
      if (accountNumbers.length > 0) {
        const matchingTransactions = await getMatchingTransactions(accountNumbers, goal.description || []);

        if (matchingTransactions.length > 0) {
          const existingUpdates = goal.updates ? JSON.parse(goal.updates) : [];
          const deletedUpdates = goal.deleted_updates ? JSON.parse(goal.deleted_updates) : [];

          // Filter out transactions that exist in deleted_updates
          const filteredTransactions = matchingTransactions.filter((newTx) => {
            return !deletedUpdates.some((deletedTx: any) =>
              deletedTx.amount === newTx.amount &&
              deletedTx.date === newTx.date &&
              deletedTx.description === newTx.description
            );
          });

          // Check for new transactions that are not in existingUpdates or deletedUpdates
          const newTransactions = filteredTransactions.filter((newTx) => {
            return !existingUpdates.some((existingTx: any) =>
              existingTx.amount === newTx.amount &&
              existingTx.date === newTx.date &&
              existingTx.description === newTx.description
            );
          });

          if (newTransactions.length > 0) {
            // Update current_amount with new transactions
            for (let i = 0; i < newTransactions.length; i++) {
              goal.current_amount += newTransactions[i].amount;
            }

            // Append new transactions to the existing updates
            goal.updates = JSON.stringify([...existingUpdates, ...newTransactions]);

            // Update the goal's `monthly_updates` field with aggregated amounts per month
            const monthlyUpdates = aggregateMonthlyUpdates([...existingUpdates, ...newTransactions]);
            goal.monthly_updates = JSON.stringify(monthlyUpdates);

            // Store the current date and time in `last_update`
            goal.last_update = new Date().toISOString();

            handleGoalUpdate(goal);  // Updates the state
            await updateDB();  // Updates Firestore with new goal data
            alert("Your transactions have been updated.");
          } else {
            alert("No new transactions to update.");
          }
        } else {
          console.log("No matching transactions found.");
        }
      } else {
        console.log("No account numbers found for the goal.");
      }
    } catch (error) {
      console.error("Error in handleDescriptionUpdateClick:", error);
    }
  };

  const handleCategoryUpdateClick = async () => {
    try {
      const accountNumbers = await getAccountNumbersForGoal();
      if (accountNumbers.length > 0 && goal.category) {
        const matchingTransactions = await getMatchingTransactionsByCategory(
          accountNumbers,
          [goal.category]  // Pass the category as an array
        );

        if (matchingTransactions.length > 0) {
          const existingUpdates = goal.updates ? JSON.parse(goal.updates) : [];
          const deletedUpdates = goal.deleted_updates ? JSON.parse(goal.deleted_updates) : [];

          // Filter out transactions that exist in deleted_updates
          const filteredTransactions = matchingTransactions.filter((newTx) => {
            return !deletedUpdates.some((deletedTx: any) =>
              deletedTx.amount === newTx.amount &&
              deletedTx.date === newTx.date &&
              deletedTx.description === newTx.description &&
              deletedTx.category === newTx.category
            );
          });

          // Check for new transactions that match the category and are not in existingUpdates or deletedUpdates
          const newTransactions = filteredTransactions.filter((newTx) => {
            return newTx.category === goal.category && // Ensure it matches the goal's category
              !existingUpdates.some((existingTx: any) =>
                existingTx.amount === newTx.amount &&
                existingTx.date === newTx.date &&
                existingTx.description === newTx.description &&
                existingTx.category === newTx.category
              );
          });

          if (newTransactions.length > 0) {
            // Update current_amount with new transactions
            for (let i = 0; i < newTransactions.length; i++) {
              goal.current_amount += newTransactions[i].amount;
            }

            // Append new transactions to the existing updates
            goal.updates = JSON.stringify([...existingUpdates, ...newTransactions]);

            // Update the goal's `monthly_updates` field with aggregated amounts per month
            const monthlyUpdates = aggregateMonthlyUpdates([...existingUpdates, ...newTransactions]);
            goal.monthly_updates = JSON.stringify(monthlyUpdates);

            // Store the current date and time in `last_update`
            goal.last_update = new Date().toISOString();

            handleGoalUpdate(goal);  // Updates the state
            await updateDB();  // Updates Firestore with new goal data
            alert("Your category-based transactions have been updated.");
          } else {
            alert("No new transactions to update.");
          }
        } else {
          console.log("No matching transactions found for the category.");
        }
      } else {
        console.log("No account numbers found for the goal or no category specified.");
      }
    } catch (error) {
      console.error("Error in handleCategoryUpdateClick:", error);
    }
  };
  

  const updateDB = async () => {
    try {
      const goalDocRef = doc(db, "goals", goal.id);
      await updateDoc(goalDocRef, {
        updates: goal.updates,
        current_amount: goal.current_amount,  // Optionally update the current amount if needed
        monthly_updates: goal.monthly_updates, // Update monthly_updates in Firestore
        last_update: goal.last_update  // Update last_update in Firestore
      });
    } catch (error) {
      console.error("Error updating goal in Firestore:", error);
    }
  };

  const timeSinceLastUpdate = (lastUpdate: string): string => {
    const now = new Date();
    const lastUpdateDate = new Date(lastUpdate);

    const diffInMilliseconds = now.getTime() - lastUpdateDate.getTime();

    // Convert milliseconds into minutes, hours, and days
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    // Return the appropriate time ago message
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };



  return (
    <div className={styles.mainPage} style={{ position: 'fixed', right: 0, top: 0, height: '100%', zIndex: "11", paddingTop: '2rem' }}>
      <div className={styles.goalPage}>
        <div className="flex flex-col gap-8">
          {/* Fixed top section */}
          <div className="fixed top-0 right-0 z-10  bg-[var(--main-background)] p-2 shadow-md" style={{ width: '85vw' }}>
            <div className="container mx-auto">
              <div className="flex-1 flex flex-col justify-center text-center p-3">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                  <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-1)', display: 'flex', alignItems: 'center' }}>
                    <span
                      className="material-symbols-outlined"
                      onClick={onClose}
                      style={{ marginRight: '0.8rem', fontSize: 'calc(1.5rem * var(--font-size-multiplier))', cursor: 'pointer' }}
                    >
                      arrow_back
                    </span>
                    {goal.name}
                  </h1>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.editViewButton} onClick={handleEditGoalPopup}>
                      Edit Details
                    </div>
                    {editPopupOpen && (
                      <EditGoalPopup togglePopup={handleEditGoalPopup} goal={goal} toggleMainPopup={onClose} />
                    )}
                    {goal.update_type == 'manual' && (
                      <>
                        <div className={styles.updateViewButton} onClick={handleUpdateGoalPopup}>
                          Update Progress
                        </div>
                        {updatePopupOpen && <UpdateGoalPopup togglePopup={handleUpdateGoalPopup} goal={goal} />}
                      </>
                    )}
                    {(goal.update_type == 'assign-description') && (
                      <>
                        <div className={styles.updateViewButton} onClick={handleDescriptionUpdateClick}>
                          Check for Updates
                        </div>
                      </>
                    )}
                    {(goal.update_type == 'assign-category') && (
                      <>
                        <div className={styles.updateViewButton} onClick={handleCategoryUpdateClick}>
                          Check for Updates
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[8rem]">
            {/* First Row */}
            <div className="container mx-auto p-4">
              <div className="flex items-stretch space-x-4">
                <div className="flex-1 flex flex-col items-center justify-between text-center bg-[var(--block-background)] rounded-lg shadow-md p-8">
                  <h2 className="text-xl font-semibold mb-4">Goal Details</h2>
                  <div className="flex flex-col space-y-2 h-full justify-center" style={{ width: 'auto' }}>
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Goal Type:</div>
                      <div className={styles.goalValue}>{goal.type}</div>
                    </div>
                    <div className={styles.goalPair}>
                      <div className={styles.goalLabel}>Update Type:</div>
                      <div className={styles.goalValue}>
                        {goal.update_type == 'assign-all' && 'Assigned Account/s'}
                        {goal.update_type == 'assign-description' && 'By Transaction Descriptions'}
                        {goal.update_type == 'assign-transactions' && 'Manual Transaction Assignment'}
                        {goal.update_type == 'assign-category' && 'By Transaction Category'}
                        {goal.update_type == 'manual' && 'Manual Updates'}
                      </div>
                    </div>
                    {goal.target_date && (
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Target Date:</div>
                        <div className={styles.goalValue}>{goal.target_date}</div>
                      </div>
                    )}
                    {goal.initial_amount !== undefined && (
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Initial Amount:</div>
                        <div className={styles.goalValue}>R {goal.initial_amount.toFixed(2)}</div>
                      </div>
                    )}
                    {goal.current_amount !== undefined && goal.type != 'Spending Limit' &&(
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Current Amount:</div>
                        <div className={styles.goalValue}>R {goal.current_amount.toFixed(2)}</div>
                      </div>
                    )}
                    {goal.spending_limit !== undefined && goal.type == 'Spending Limit' &&(
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Monthly Limit:</div>
                        <div className={styles.goalValue}>R {goal.spending_limit.toFixed(2)}</div>
                      </div>
                    )}
                    {goal.monthly_updates !== undefined && goal.type == 'Spending Limit' &&(
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Spent this Month:</div>
                        <div className={styles.goalValue}>R {monthlyBudgetSpent(goal)}</div>
                      </div>
                    )}
                    {goal.target_amount !== undefined && (
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Target Amount:</div>
                        <div className={styles.goalValue}>R {goal.target_amount.toFixed(2)}</div>
                      </div>
                    )}
                    {goal.target_date !== undefined && (
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Days Left:</div>
                        <div className={styles.goalValue}>
                          {calculateDaysLeft(goal.target_date) > 0 ? `${calculateDaysLeft(goal.target_date)} days` : 'Target Date Passed'}
                        </div>
                      </div>
                    )}
                    {goal.last_update !== undefined && (
                      <div className={styles.goalPair}>
                        <div className={styles.goalLabel}>Last Update:</div>
                        <div className={styles.goalValue}>
                          {timeSinceLastUpdate(goal.last_update)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-between items-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8" style={{ width: '20vw' }}>
                  <h2 className="text-xl font-semibold mb-4">
                    {goal.type != 'Spending Limit' ? 'Overall Goal Progress' : 'Spent This Month'}
                  </h2>
                  <div className="relative flex-grow flex justify-center items-center h-full">
                    <div className="w-[20vh] h-[20vh]">
                      <CircularProgressbar
                        value={calculateProgressPercentage(goal)}
                        styles={buildStyles({
                          pathColor: getColorForValue(calculateProgressPercentage(goal), goal.type),
                          trailColor: '#d6d6d6',
                          strokeLinecap: 'round',
                        })}
                      />
                      <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold"
                        style={{ color: getColorForValue(calculateProgressPercentage(goal), goal.type) }}
                      >
                        {`${calculateProgressPercentage(goal).toFixed(2)}%`}
                      </div>
                    </div>
                  </div>
                </div>

                {goal.type != 'Spending Limit' && (
                  <div className="flex flex-col items-center justify-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8" style={{ width: '20vw' }}>
                    <h2 className="text-xl font-semibold mb-4">Goal Wingman</h2>
                    <div className="w-full h-full flex items-center justify-center">
                      <Image src={getGif(calculateProgressPercentage(goal))} alt="Goal GIF" className="object-contain w-full h-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Second Row - Updates and Bar Chart */}
            {goal.updates && (
              <>
                <div className="container mx-auto p-4">
                  <div className="flex justify-between items-start gap-8">
                    <div className="flex-1 flex flex-col justify-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8 h-[40vh]">
                      <h2 className="text-xl font-semibold mb-10">
                        {goal.type != 'Spending Limit' ? 'Goal Progress Over Time' : 'Spending by Month'}
                      </h2>
                      <ResponsiveContainer width="100%" height="80%">
                        <BarChart
                          data={getUpdates()}
                          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                        >
                          <XAxis
                            dataKey="month"
                            stroke="var(--main-text)"
                            tick={{ fill: 'var(--main-text)', fontSize: 12 }}
                          />
                          <YAxis
                            tick={{ fill: 'var(--main-text)', fontSize: 12 }}
                            stroke="var(--main-text)"
                            width={50}
                          >
                            <Label
                              value="Amount"
                              angle={-90}
                              position="insideLeft"
                              style={{ textAnchor: 'middle', fill: 'var(--main-text)', fontSize: '14px' }}
                            />
                          </YAxis>
                          <Tooltip
                            cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                            contentStyle={{
                              backgroundColor: 'var(--main-background)',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px',
                            }}
                          />
                          <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
                          <Bar
                            dataKey="amount"
                            fill="var(--primary-1)"
                            radius={[10, 10, 0, 0]}
                            barSize={40}
                            stroke="var(--main-border)"
                            strokeWidth={1}
                            stackId="a"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {currentGoal.updates && JSON.parse(currentGoal.updates).length > 0 && (
                  <div className="container mx-auto p-4">
                    <div className="flex justify-between items-start gap-8">
                      <div className="flex-1 flex flex-col justify-center text-center bg-[var(--block-background)] rounded-lg shadow-md p-8">
                        <h2 className="text-xl font-semibold mb-10">Updates</h2>
                        <UpdateTable goal={currentGoal} onUpdateGoal={handleGoalUpdate} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export interface GoalsPageProps {
}

export function GoalsPage() {
  const [Goals, setGoals] = useState<Goal[]>([]);
  const [isGoalPopupOpen, setIsGoalPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [updatePopupOpen, setUpdatePopupOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [sortOption, setSortOption] = useState('name');
  const [hasGoals, setHasGoals] = useState(false);
  const user = useContext(UserContext);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleGoalUpdate = (updatedGoal: Goal) => {
    setGoals(prevGoals => prevGoals.map(goal =>
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));

    if (selectedGoal?.id === updatedGoal.id) {
      setSelectedGoal(updatedGoal);
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
  };

  const sortGoals = (goals: Goal[], option: string) => {
    return [...goals].sort((a, b) => {
      const aValue =
        option === 'name'
          ? a.name
          : option === 'type'
            ? a.type
            : option === 'end_date'
              ? new Date(a.target_date || '').getTime()
              : option === 'progress'
                ? calculateProgressPercentage(a)
                : 0;

      const bValue =
        option === 'name'
          ? b.name
          : option === 'type'
            ? b.type
            : option === 'end_date'
              ? new Date(b.target_date || '2100-01-01').getTime()
              : option === 'progress'
                ? calculateProgressPercentage(b)
                : 0;

      // Compare values
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
  };

  const calculateProgressPercentage = (goal: Goal): number => {
    if (goal.current_amount && goal.target_amount !== undefined) {
      if (goal.initial_amount) {
        return Math.min(
          100,
          ((goal.initial_amount - goal.current_amount) /
            (goal.initial_amount - goal.target_amount)) *
          100
        );
      } else {
        return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
      }
    }
    if (
      goal.spending_limit !== undefined &&
      goal.monthly_updates !== undefined
    ) {
      const amountForCurrentMonth = monthlyBudgetSpent(goal);
      return (amountForCurrentMonth / goal.spending_limit) * 100;
    }
    return 0;
  };

  const fetchGoals = async () => {
    if (user && user.uid) {
      try {
        const goalsCollection = collection(db, 'goals');
        const goalsQuery = query(goalsCollection, where('uid', '==', user.uid));
        const goalsSnapshot = await getDocs(goalsQuery);
        const goalsList = goalsSnapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Goal, 'id'>;
          return {
            id: doc.id,
            ...data,
          };
        });
        if (goalsList.length > 0) {
          setHasGoals(true);
        }
        setGoals(sortGoals(goalsList, sortOption));
      } catch (error) {
        console.error('Error getting goals document:', error);
      }
    }
  };

  const addGoalPopup = () => {
    setIsGoalPopupOpen(!isGoalPopupOpen);
    fetchGoals();
  };

  useEffect(() => {
    fetchGoals();
  }, [sortOption, selectedGoal]);

  const monthlyBudgetSpent = (goal: Goal): number => {
    if (goal.monthly_updates !== undefined) {
      const data = JSON.parse(goal.monthly_updates);
      const currentMonthYear = `${monthNames[new Date().getMonth()]
        } ${new Date().getFullYear()}`;
      const currentMonthData = data.find(
        (item: { month: string }) => item.month === currentMonthYear
      );
      const amountForCurrentMonth = currentMonthData
        ? currentMonthData.amount
        : 0;
      return amountForCurrentMonth;
    }
    return 0;
  };

  const sortedGoals = sortGoals(Goals, sortOption);

  const handleNameClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  return (
    <>
      {!hasGoals ? (
        <>
          <div className={styles.noGoalScreen}>
            <div className={styles.noGoalText}>Add your first goal:</div>
            <button className={styles.addGoalsButton} onClick={addGoalPopup}>
              Add a Goal
            </button>
            {isGoalPopupOpen && <AddGoalPopup togglePopup={addGoalPopup} />}
          </div>
        </>
      ) : (
        <>
          <div className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p className={styles.sortHeader}>Sort By:</p>
              <select
                value={sortOption}
                onChange={handleSortChange}
                className={styles.sortDropdown}
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="end_date">Target Date</option>
                <option value="progress">Progress</option>
              </select>
            </div>
            <button className={styles.addAGoalButton} onClick={addGoalPopup}>
              Add a Goal
            </button>
            {isGoalPopupOpen && <AddGoalPopup togglePopup={addGoalPopup} />}
          </div>
          <div
            style={{
              width: '85vw',
              backgroundColor: 'var(--main-background)',
              marginBottom: 'calc((4rem * var(--font-size-multiplier)))',
            }}
          ></div>
          <div className={styles.planningModalContainer}>
            <div className="p-4">
              <table className="min-w-full table-auto border-collapse border border-gray-200">
                <thead>
                  <tr style={{ color: 'var(--secondary-text)', backgroundColor: 'var(--primary-1)' }}>
                    <th className="border border-gray-200 p-2 text-left">Name</th>
                    <th className="border border-gray-200 p-2 text-left">Type</th>
                    <th className="border border-gray-200 p-2 text-left">Target Date</th>
                    <th className="border border-gray-200 p-2 text-left">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGoals.map((goal, index) => (
                    <tr key={index}
                      style={{ backgroundColor: 'var(--block-background)', fontSize: "calc(1.2rem * var(--font-size-multiplier))" }}>
                      <td className="border p-2 underline cursor-pointer hover:text-blue-700"
                        onClick={() => handleNameClick(goal)}>{goal.name}</td>
                      <td className="border border-gray-200 p-2">{goal.type}</td>
                      <td className="border border-gray-200 p-2">
                        {goal.target_date}
                      </td>
                      <td className="border border-gray-200 p-2">
                        <div className="flex items-center">
                          <div className="relative w-full h-8 rounded" style={{ backgroundColor: 'var(--main-background)' }}>
                            <div
                              className="absolute top-0 left-0 h-full bg-green-500 rounded"
                              style={{
                                width: `${calculateProgressPercentage(goal)}%`,
                                backgroundColor: 'var(--primary-2)',
                              }}
                            />

                          </div>
                          <span className="ml-3 text-sm" style={{ color: 'var(--main-text' }}>
                            {calculateProgressPercentage(goal).toFixed(2)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedGoal && (
              <>
                <GoalInfoPage goal={selectedGoal} onClose={() => setSelectedGoal(null)} onUpdateGoal={handleGoalUpdate}></GoalInfoPage>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default GoalsPage;
