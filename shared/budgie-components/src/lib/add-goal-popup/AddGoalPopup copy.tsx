import React, { useState, useContext, useEffect } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import styles from './AddGoalPopup.module.css';
import '../../root.css';

/* eslint-disable-next-line */
/*
export interface GraphCarouselProps {
  goal: Goal;
}

const GraphCarousel = ({ goal }: GraphCarouselProps) => {
  const slides = ['Slide 1', 'Slide 2', 'Slide 3'];
  const [currentIndex, setCurrentIndex] = useState(0);

  interface GoalUpdate {
    amount: number;
    date: string;
  }

  interface GoalMonthlyUpdate {
    amount: number;
    month: string;
  }

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
    if (goal.current_amount && goal.initial_amount !== undefined) {
      return Math.min(
        100,
        ((goal.initial_amount - goal.current_amount) / (goal.initial_amount)) * 100
      );
    }
    if (
      goal.spending_limit !== undefined &&
      goal.monthly_updates !== undefined
    ) {
      const amountForCurrentMonth = monthlyBudgetSpent(now.getMonth());
      return (amountForCurrentMonth / goal.spending_limit) * 100;
    }
    return 0;
  };

  const monthlyBudgetSpent = (month: number): number => {
    if (goal.monthly_updates !== undefined) {
      const data = JSON.parse(goal.monthly_updates);
      const currentMonthYear = `${currentMonthName} ${currentYear}`;
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

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 2 - 1 ? 0 : prevIndex + 1));
  };

  const getUpdates = () => {
    if (goal.monthly_updates) {
      const updatesData: GoalMonthlyUpdate[] = JSON.parse(goal.monthly_updates);

      const parseMonth = (monthStr: string): Date => {
        return new Date(`1 ${monthStr}`);
      };

      const formattedData = updatesData
        .map((update) => ({
          month: update.month,
          amount: update.amount,
          date: parseMonth(update.month),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(({ date, ...rest }) => rest);
      return formattedData;
    }
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

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const currentMonthName = monthNames[currentMonthIndex];

  const getColorForValue = (value: number): string => {
    if (value < 100) return 'var(--primary-1)';
    return '#FF0000';
  };

  return (
    <div className={styles.carousel}>
      <div
        className={styles.carouselContainer}
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'none',
        }}
      >
        {goal.type === 'Savings' && (
          <div className={styles.carouselSlide} key="progress">
            <div className={styles.goalGraph}>
              <CircularProgressbar
                value={calculateProgressPercentage(goal)}
                styles={buildStyles({
                  pathColor: 'var(--primary-1)',
                  trailColor: '#d6d6d6',
                })}
              />
              <div className={styles.percentageDisplay}>
                {`${calculateProgressPercentage(goal).toFixed(2)}%`}
              </div>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={prevSlide}>
                  &#8592;
                </span>
              ) : (
                <span></span>
              )}
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Goal Progress
              </span>
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={nextSlide}>
                  &#8594;
                </span>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        )}

        {goal.type === 'Savings' && goal.updates !== undefined && (
          <div className={styles.carouselSlide} key="chart">
            <div className={styles.goalGraph}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getUpdates()}
                  margin={{ top: 0, right: 0, bottom: 0, left: 10 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={false}
                    stroke="var(--main-text)"
                  />
                  <YAxis
                    tick={{ fill: 'var(--main-text)' }}
                    stroke="var(--main-text)"
                  >
                    <Label
                      value="Amount"
                      angle={-90}
                      position="left"
                      style={{ textAnchor: 'middle', fill: 'var(--main-text)' }}
                    />
                  </YAxis>
                  <Tooltip cursor={{ fill: 'var(--main-background)' }} />
                  <Bar dataKey="amount" fill="var(--primary-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span className={styles.arrow} onClick={prevSlide}>
                &#8592;
              </span>
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Savings per Month
              </span>
              <span className={styles.arrow} onClick={nextSlide}>
                &#8594;
              </span>
            </div>
          </div>
        )}

        {goal.type === 'Debt Reduction' && (
          <div className={styles.carouselSlide} key="progress">
            <div className={styles.goalGraph}>
              <CircularProgressbar
                value={calculateProgressPercentage(goal)}
                styles={buildStyles({
                  pathColor: 'var(--primary-1)',
                  trailColor: '#d6d6d6',
                })}
              />
              <div className={styles.percentageDisplay}>
                {`${calculateProgressPercentage(goal).toFixed(2)}%`}
              </div>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={prevSlide}>
                  &#8592;
                </span>
              ) : (
                <span></span>
              )}
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Goal Progress
              </span>
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={nextSlide}>
                  &#8594;
                </span>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        )}

        {goal.type === 'Debt Reduction' && goal.updates !== undefined && (
          <div className={styles.carouselSlide} key="chart">
            <div className={styles.goalGraph}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getUpdates()}
                  margin={{ top: 0, right: 0, bottom: 0, left: 10 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={false}
                    stroke="var(--main-text)"
                  />
                  <YAxis
                    tick={{ fill: 'var(--main-text)' }}
                    stroke="var(--main-text)"
                  >
                    <Label
                      value="Amount"
                      angle={-90}
                      position="left"
                      style={{ textAnchor: 'middle', fill: 'var(--main-text)' }}
                    />
                  </YAxis>
                  <Tooltip cursor={{ fill: 'var(--main-background)' }} />
                  <Bar dataKey="amount" fill="var(--primary-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span className={styles.arrow} onClick={prevSlide}>
                &#8592;
              </span>
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Debt Payments per Month
              </span>
              <span className={styles.arrow} onClick={nextSlide}>
                &#8594;
              </span>
            </div>
          </div>
        )}

        {goal.type === 'Spending Limit' && (
          <div className={styles.carouselSlide} key="progress">
            <div className={styles.goalGraph}>
              <CircularProgressbar
                value={calculateProgressPercentage(goal)}
                styles={buildStyles({
                  pathColor: getColorForValue(
                    calculateProgressPercentage(goal)
                  ),
                  trailColor: '#d6d6d6',
                })}
              />
              <div
                className={styles.percentageDisplay}
                style={{
                  color: getColorForValue(calculateProgressPercentage(goal)),
                }}
              >
                {`${calculateProgressPercentage(goal).toFixed(2)}%`}
              </div>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={prevSlide}>
                  &#8592;
                </span>
              ) : (
                <span></span>
              )}
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Budget Used for {currentMonthName} {currentYear}
              </span>
              {goal.updates !== undefined ? (
                <span className={styles.arrow} onClick={nextSlide}>
                  &#8594;
                </span>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        )}

        {goal.type === 'Spending Limit' && goal.updates !== undefined && (
          <div className={styles.carouselSlide} key="chart">
            <div className={styles.goalGraph}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getBudgetUpdates()}
                  margin={{ top: 0, right: 0, bottom: 0, left: 10 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={false}
                    stroke="var(--main-text)"
                  />
                  <YAxis
                    tick={{ fill: 'var(--main-text)' }}
                    stroke="var(--main-text)"
                  >
                    <Label
                      value="Amount"
                      angle={-90}
                      position="left"
                      style={{ textAnchor: 'middle', fill: 'var(--main-text)' }}
                    />
                  </YAxis>
                  <Tooltip cursor={{ fill: 'var(--main-background)' }} />
                  <Bar dataKey="amount" stackId="a" fill="var(--primary-1)" />
                  <Bar dataKey="excess" stackId="a" fill="red" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span className={styles.arrow} onClick={prevSlide}>
                &#8592;
              </span>
              <span
                className={styles.goalLabel}
                style={{
                  marginLeft: '1rem',
                  marginRight: '1rem',
                  color: 'var(--main-text)',
                }}
              >
                Amount Spent per Month
              </span>
              <span className={styles.arrow} onClick={nextSlide}>
                &#8594;
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};*/

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
          <button
            onClick={() => setActiveTab('Debt')}
            className={activeTab === 'Debt' ? `${styles.active} ` : ''}
          >
            Debt
          </button>
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

const GoalForm: React.FC<GoalFormProps> = (props: GoalFormProps) => {
  const [goalName, setGoalName] = useState('');
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(0);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const user = useContext(UserContext);
  const [data, setData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    if (user && user.uid) {
      e.preventDefault();

      const goalData: any = {
        type: props.activeTab,
        name: goalName,
        start_date: startDate,
        uid: user.uid,
      };

      if (props.activeTab === 'Savings' || props.activeTab === 'Debt') {
        goalData.current_amount = currentAmount;
        goalData.target_amount = targetAmount;
        goalData.target_date = targetDate;
        if (props.activeTab === 'Debt') {
          goalData.initial_amount = currentAmount;
        }
      } else if (props.activeTab === 'Spending') {
        goalData.spending_limit = spendingLimit;
      }

      try {
        await addDoc(collection(db, 'goals'), goalData);
        props.togglePopup();
      } catch (error) {
        console.error('Error saving goal:', error);
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
    console.log(computedStyle.getPropertyValue('--font-size-multiplier'));
    return widthString + 'vw';
  }

  const popupWidth = getPopupWidth();

  const [accountOptions, setAccountOptions] = useState<
    { alias: string; accountNumber: string }[]
  >([]);
  const [selectedAlias, setSelectedAlias] = useState<string>('');
  const [currentAccountNumber, setCurrentAccountNumber] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user && user.uid) {
        try {
          const q = query(
            collection(db, 'accounts'),
            where('uid', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          const accountOptionsList = querySnapshot.docs.map((doc) => ({
            alias: doc.data().alias,
            accountNumber: doc.data().account_number,
          }));
          setAccountOptions(accountOptionsList);
          setSelectedAlias(accountOptionsList[0].alias);
          setCurrentAccountNumber(accountOptionsList[0].accountNumber);

        } catch (error) {
          console.error('Error fetching aliases: ', error);
          setError('Failed to fetch accounts. Please try again later.');
        }
      }
    };

    fetchAccounts();
  }, [user]);

  const handleAccountDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = event.target.value;
    const selectedOption = accountOptions.find(
      (option) => option.alias === selected
    );
    if (selectedOption) {
      setSelectedAlias(selected);
      setCurrentAccountNumber(selectedOption.accountNumber);
      setData(null);
      setShowNoData(false);
    }
  };

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
                If you have already saved money towards this goal, add that
                amount here. If you haven't, you should leave it as 0.
              </span>
              <label>Associated Account:</label>
              <select
                className={styles.accountDropdown}
                value={selectedAlias}
                onChange={handleAccountDropdownChange}
              >
                {accountOptions.map((option, index) => (
                  <option key={index} value={option.alias}>
                    {option.alias}
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
                Enter the amount of money you aim to save for this goal.
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

        {props.activeTab === 'Debt' && (
          <>
            <p className={styles.goalDescription}>
              Set your debt reduction goal below:
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
                Enter a descriptive name for your debt reduction goal. This
                could be a goal to pay off any money you owe, such as a credit
                card or a loan.
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
                Enter the amount of money you currently owe.
              </span>
              <label>Current Debt Amount:</label>
              <ClearableInput
                value={currentAmount}
                onChange={setCurrentAmount}
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
                Enter the amount of money you aim to owe. This should be less
                than the current amount you owe and can even be zero.
              </span>
              <label>Target Debt Amount:</label>
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
                Select the date you started working towards this goal.
              </span>
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
                Select the date you started working towards this goal.
              </span>
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
          </>
        )}

        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default AddGoalPopup;
