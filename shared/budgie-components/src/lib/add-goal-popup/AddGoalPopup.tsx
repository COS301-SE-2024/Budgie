import React, { useState, useContext, useEffect } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import styles from './AddGoalPopup.module.css';
import '../../root.css';

/* eslint-disable-next-line */

interface ClearableInputProps {
  value: number;
  onChange: (value: number) => void;
}

const ClearableInput: React.FC<ClearableInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState<number | string>(value);

  const handleFocus = () => {
    if (inputValue === value) {
      setInputValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? '' : Number(e.target.value);
    setInputValue(newValue);
    onChange(newValue as number);
  };

  return (
    <input
      type="number"
      value={inputValue}
      onFocus={handleFocus}
      onChange={handleChange}
      required
    />
  );
};

export interface AddGoalPopupProps {
  togglePopup: () => void;
}

export function AddGoalPopup(props: AddGoalPopupProps) {
  const [activeTab, setActiveTab] = useState<string>('Savings');

  return (
    <div className={styles.addGoalPopup}>
      <div className={styles.popupContainer}>
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('Savings')}
            className={activeTab === 'Savings' ? `${styles.active} ` : ''}
          >
            Savings
          </button>
          {/* <button
            onClick={() => setActiveTab('Debt')}
            className={activeTab === 'Debt' ? `${styles.active} ` : ''}
          >
            Debt
          </button> */}
          <button
            onClick={() => setActiveTab('Spending')}
            className={activeTab === 'Spending' ? `${styles.active} ` : ''}
          >
            Spending
          </button>
        </div>
        <div className={styles.popupContent}>
          <GoalForm activeTab={activeTab} togglePopup={props.togglePopup} />
          <button className={styles.cancelButton} onClick={props.togglePopup}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface GoalFormProps {
  activeTab: string;
  togglePopup: () => void;
}

type Account = {
  name: string;
  alias: string;
  type: string;
  number: string;
};

type Transaction = {
  date: string;
  amount: string;
  balance: string;
  description: string;
  category: string;
};

const Months = [
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

function getMonthName(month: string): string {
  // Convert the month string to a number and get the corresponding month name
  const monthIndex = parseInt(month, 10) - 1; // Convert to 0-indexed
  return Months[monthIndex] || ''; // Return an empty string if month is invalid
}

function getLast12Months(): string[] {
  const yearMonths: string[] = [];
  const currentDate = new Date();

  for (let i = 0; i < 12; i++) {
    // Calculate the current month and year
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // getMonth() is 0-indexed, so add 1

    // Format month as MM (e.g., "01", "02", ..., "12")
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;

    // Push the formatted "MMYYYY" string to the array
    yearMonths.push(`${formattedMonth}${year}`);

    // Go back one month
    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  return yearMonths;
}

function getUniqueYearsDescending(yearMonths: string[]): string[] {
  // Extract the year part from each "MMYYYY" string
  const years = yearMonths.map((ym) => ym.slice(2));

  // Create a Set to get unique years and then convert it back to an array
  const uniqueYears = Array.from(new Set(years));

  // Sort the years in descending order (highest year first)
  uniqueYears.sort((a, b) => parseInt(b) - parseInt(a));

  return uniqueYears;
}

const GoalForm: React.FC<GoalFormProps> = (props: GoalFormProps) => {
  //savings
  const [accountsArray, setAccountsArray] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [goalName, setGoalName] = useState('');
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(0);
  const [targetDate, setTargetDate] = useState<string | null>(null);
  //spending
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [averageMonthly, setAverageMonthly] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const user = useContext(UserContext);

  useEffect(() => {
    //fetch accounts
    const fetchAllAccounts = async (): Promise<Account[]> => {
      if (!(user && user.uid)) {
        return [];
      }
      const accRef = collection(db, 'accounts');
      const q = query(accRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      let acc: Account[] = [];

      if (querySnapshot.docs.length != 0) {
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
        return [];
      }
    };

    fetchAllAccounts().then((accounts) => {
      setAccountsArray(accounts);
      if (accounts.length > 0 && selectedAccount === '') {
        setSelectedAccount(accounts[0].alias);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedAccount != '' && accountsArray.length > 0) {
      let currAccount = accountsArray.find(
        (account) => account.alias == selectedAccount
      );
      //fetch avg monthly in this function
      const fetchBalanceAndAverage = async (
        account: Account
      ): Promise<number[]> => {
        //set current balance amount
        if (user && user.uid && currAccount) {
          //get latest year uploaded
          const yearRef = collection(db, 'years_uploaded');
          const qYears = query(yearRef, where('uid', '==', user.uid));
          const queryYearsSnapshot = await getDocs(qYears);

          const doc = queryYearsSnapshot.docs[0];
          let years = JSON.parse(doc.data().years);
          let yearNumbers = years.map(Number);
          let highestYear = Math.max(...yearNumbers);
          //get transaction data for that year
          const dataRef = collection(db, `transaction_data_${highestYear}`);
          const qData = query(
            dataRef,
            where('uid', '==', user.uid),
            where('account_number', '==', currAccount.number)
          );
          const queryDataSnapshot = await getDocs(qData);
          const TransactionData = queryDataSnapshot.docs[0].data();
          //get balance for most recent month of data
          let recentMonth = '';
          for (const month of Months) {
            if (TransactionData[month]) {
              recentMonth = month;
            }
          }
          //get balance for this month
          let balance = JSON.parse(TransactionData[recentMonth])[0].balance;

          //get average monthly spend------------------------------
          let monthYears = getLast12Months();
          let uniqueYears = getUniqueYearsDescending(monthYears);

          let sum = 0;
          let divisor = 0;
          for (const year of uniqueYears) {
            const dataRef = collection(db, `transaction_data_${year}`);
            const qData = query(
              dataRef,
              where('uid', '==', user.uid),
              where('account_number', '==', currAccount.number)
            );
            const queryDataSnapshot = await getDocs(qData);

            for (const monthYear of monthYears) {
              const yearOfMonthYear = monthYear.slice(2);
              const month = monthYear.slice(0, 2);
              const monthName = getMonthName(month);
              if (yearOfMonthYear === year) {
                if (!queryDataSnapshot.empty) {
                  const TransactionData = queryDataSnapshot.docs[0].data();
                  if (TransactionData[monthName]) {
                    let data: Transaction[] = JSON.parse(
                      TransactionData[monthName]
                    );
                    for (const Transaction of data) {
                      if (
                        Transaction.category != 'Transfer' &&
                        Transaction.category != 'Income' &&
                        parseFloat(Transaction.amount) < 0
                      ) {
                        sum += Math.abs(parseFloat(Transaction.amount));
                      }
                    }

                    divisor += 1;
                  }
                }
              }
            }
          }
          let averageMonthlySpend = sum / divisor;
          averageMonthlySpend = Math.round(averageMonthlySpend * 100) / 100;

          return [balance, averageMonthlySpend];
        }

        return [0, 0];
      };

      if (currAccount) {
        fetchBalanceAndAverage(currAccount).then((balanceAndAverage) => {
          setCurrentAmount(balanceAndAverage[0]);
          setAverageMonthly(balanceAndAverage[1]);
        });
      }
    }
  }, [selectedAccount, accountsArray]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (user && user.uid && accountsArray.length > 0) {
      e.preventDefault();

      let currAccount = accountsArray.find(
        (account) => account.alias == selectedAccount
      );
      if (currAccount) {
        const goalData: any = {
          type: props.activeTab,
          name: goalName,
          uid: user.uid,
          account_number: currAccount.number,
        };

        if (props.activeTab == 'Savings') {
          goalData.target_amount = targetAmount;
          goalData.target_date = targetDate;
        }

        if (props.activeTab == 'Spending') {
          goalData.target_amount = spendingLimit;
          goalData.start_date = startDate;
        }

        try {
          await addDoc(collection(db, 'goals'), goalData);
          props.togglePopup();
        } catch (error) {
          console.error('Error saving goal:', error);
        }
      }
    }
  };

  function getPopupWidth(): string {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const width =
      20 -
      (35 *
        parseFloat(computedStyle.getPropertyValue('--font-size-multiplier')) -
        35) *
        0.5;
    const widthString = width.toString();
    // console.log(computedStyle.getPropertyValue('--font-size-multiplier'));
    return widthString + 'vw';
  }

  const popupWidth = getPopupWidth();

  return (
    <div className={styles.goalForm}>
      <form onSubmit={handleSubmit}>
        {props.activeTab === 'Savings' && (
          <>
            <p className={styles.goalDescription}>
              Set your savings goal below:
            </p>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Enter a descriptive name for your savings goal. This could be a
                short term goal like a vacation fund or a long term goal like
                your retirement savings.
              </span>
              <label>Goal Name:</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Choose which account you will be storing your savings.
              </span>
              <label>Account:</label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                }}
                className="cursor-pointer"
              >
                {accountsArray.map((account) => (
                  <option key={account.alias} value={account.alias}>
                    {account.alias}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Your current Balance for the selected account.
              </span>
              <label>Current Balance:</label>
              {currentAmount}
            </div>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Enter the amount of money you aim to save. This should be
                greater than your current balance.
              </span>
              <label>Target Savings Amount:</label>
              <ClearableInput value={targetAmount} onChange={setTargetAmount} />
            </div>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Select the date by which you want to reach this goal.
              </span>
              <label>Target Date:</label>
              <input
                type="date"
                value={targetDate || ''}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {props.activeTab === 'Spending' && (
          <>
            <p className={styles.goalDescription}>
              Set your spending goal below:
            </p>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Enter a descriptive name for your spending reduction goal. This
                could be a specific type of spending you want to reduce such as
                entertainment or dining out.
              </span>
              <label>Goal Name:</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Choose which account you want to limit spending for.
              </span>
              <label>Account:</label>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                }}
                className="cursor-pointer"
              >
                {accountsArray.map((account) => (
                  <option key={account.alias} value={account.alias}>
                    {account.alias}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Your current average monthly spend for the selected account.
              </span>
              <label>Average Monthly Spend:</label>
              {averageMonthly}
            </div>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Enter the monthly spending limit you want to set for this type
                of expense. Spending below this amount each month will
                contribute to your progress.
              </span>
              <label>Spending Limit per Month:</label>
              <ClearableInput
                value={spendingLimit}
                onChange={setSpendingLimit}
              />
            </div>
            <div className={styles.formGroup}>
              <span
                className={`material-symbols-outlined ${styles.icon}`}
                style={{
                  fontSize: 'calc(1rem * var(--font-size-multiplier))',
                  color: 'var(--greyed-text)',
                }}
              >
                info
              </span>
              <span className={styles.popupText} style={{ width: popupWidth }}>
                Select the date you started working towards this goal.
              </span>
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate || ''}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default AddGoalPopup;
