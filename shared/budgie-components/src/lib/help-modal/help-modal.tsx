'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import signup from '../../../public/images/signup.png';
import signin from '../../../public/images/signin.png';
import account1 from '../../../public/images/account1.png';
import account2 from '../../../public/images/account2.png';
import account3 from '../../../public/images/account3.png';
import account4 from '../../../public/images/account4.png';
import goals1 from '../../../public/images/goals1.png';
import goals2 from '../../../public/images/goals2.png';
import goals3 from '../../../public/images/goals3.png';
import goals4 from '../../../public/images/goals4.png';
import comparison1 from '../../../public/images/comparisons1.png';
import comparison2 from '../../../public/images/comparisons2.png';
import comparison3 from '../../../public/images/comparisons3.png';
import insights1 from '../../../public/images/insights1.png';
import overview from '../../../public/images/overview.png';
import transactions from '../../../public/images/transactions.png';
import styles from './help-modal.module.css';

/* eslint-disable-next-line */
export interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal(props: HelpModalProps) {
  const [selectedSection, setSelectedSection] = useState('introduction');

  const renderContent = () => {
    switch (selectedSection) {
      case 'introduction':
        return (
          <div className="max-w-full">
            <h2 className="text-BudgieBlue">Welcome to Budgie</h2>
            <p className="text-s text-gray-500">
              Budgie is a financial management tool designed to help users take
              control of their spending. Users can import bank statements,
              categorize their spending, and set financial goals. By predicting
              upcoming costs and sharing financial management insights, Budgie
              provides a comprehensive view on how users can achieve monetary
              freedom.
            </p>
          </div>
        );
      case 'Overview':
        return (
          <div className="max-w-full">
            <h2 className="text-lg font-bold text-blue-500">Overview</h2>
            <p className="text-s text-gray-500">
              The overview page provides a summary of the bank account
              information and the results obtained from analyzing this data. It
              provided a quick glimpse at information such as the last
              transaction, your average spending and spending by category.
            </p>
            <div className="mt-4 h-[642px] w-[535px]">
              <Image src={overview} width={642} height={535} alt="overview" />
            </div>
          </div>
        );
      case 'Account Setup:':
        return (
          <div className="w-full max-h-[80vh] overflow-y-auto overflow-hidden break-words">
            <h2 className="text-lg font-bold text-blue-500">Account Setup</h2>
            <p className="text-s text-gray-500">
              <strong>Sign In:</strong> Enter your email and password and click
              login. Alternatively login using yout google
              credentials.Alternatively login using your google account
              credentials.
            </p>
            <div className="mt-4 h-[642px] w-[535px]">
              <Image src={signin} width={642} height={535} alt="signin" />
            </div>
            <p className="text-s text-gray-500">
              <strong>Sign Up:</strong> Open the app and tap 'Sign Up' to create
              a new account by entering your email and password. Click sign up.
              Alternatively login using your google account credentials.
            </p>
            <div className="mt-4 h-[642px] w-[535px]">
              <Image src={signup} width={642} height={535} alt="signup" />
            </div>
          </div>
        );
      case 'Accounts':
        return (
          <div className="w-full max-h-[80vh] overflow-y-auto overflow-hidden break-words">
            <h2 className="text-lg font-bold text-blue-500">Account</h2>
            <p className="text-s text-gray-500">
              Click on Accounts Tab and then click on Add Account pane. Choose
              from the three options the type of account you want to add. Upload
              a csv to begin the tracking of your data. Enter an alias for the
              account you just added to make it distinct. Click on the "Add
              Account" button and now the account is being tracked.
            </p>
            <Image src={account1} width={642} height={535} alt="account1" />
            <Image src={account2} width={642} height={535} alt="account2" />
            <Image src={account3} width={642} height={535} alt="account3" />
            <Image src={account4} width={642} height={535} alt="account4" />
          </div>
        );
      case 'Transactions':
        return (
          <div className="w-full max-h-[80vh] overflow-y-auto overflow-hidden break-words">
            <h2 className="text-lg font-bold text-blue-500">Transactions</h2>
            <p className="text-s text-gray-500">
              Once an account is added and a csv provided, the transactions for
              the account are visible on this page. Each transaction is
              categorized and placed as either an expense or income. The
              transactions can be manually categorized by clicking on the
              transaction and manually choosing a category. It's possible to
              traverse the transactions of different accounts by choosing to
              view another account by clicking on it's alias name. The
              transactions can be viewed yearly or monthly based on preference.
            </p>
            <Image
              src={transactions}
              width={642}
              height={535}
              alt="transactions"
            />
          </div>
        );
      case 'Goals':
        return (
          <div className="w-full max-h-[80vh] overflow-y-auto overflow-hidden break-words">
            <h2 className="text-lg font-bold text-blue-500">Goals</h2>
            <p className="text-s text-gray-500">
              The goals page allows a user to set a goal that they would like to
              obtain, by setting a interval to achieve that goal. The goal can
              either be a "savings","limit spending" and "debt reduction" goal.
              The goal can either be updated manually or automatically using the
              uploaded transaction data. There can be conditions to the goal
              such as only a specific category od transactions being noticed.
            </p>
            <Image src={goals1} width={642} height={535} alt="goals1" />
            <p className="text-s text-gray-500">
              Enter the goal name, target amount and date you wish to accomplish
              the goal. Click Next button to proceed.
            </p>
            <Image src={goals2} width={642} height={535} alt="goals2" />
            <p className="text-s text-gray-500">
              Choose whether you want to add some conditions under which the
              goal should have. If no then click "Confirm" button otherwise
              Click "Add Condition".
            </p>
            <Image src={goals3} width={642} height={535} alt="goals3" />
            <p className="text-s text-gray-500">
              Choose whether you want some key word in your transactions to be
              the condition by entering it in the textbox and clicking the Add
              button. Optionallly you can click on a account to have it's
              transactions considered.
            </p>
            <Image src={goals4} width={642} height={535} alt="goals4" />
          </div>
        );
      case 'Insights':
        return (
          <div className="w-full max-h-[80vh] overflow-y-auto overflow-hidden break-words">
            <h2 className="text-lg font-bold text-blue-500">Insights</h2>
            <p className="text-s text-gray-500">
              <h1>Petrol Prices</h1> This section provides an overview of fuel
              prices, including 95 Unleaded, 93 Unleaded, and Diesel 50ppm, for
              both coastal and inland regions. Users can track price changes
              from the previous month, current month, and upcoming month.{' '}
              <h1>Bank Insights</h1> Here, users can view information about
              different banks. It outlines the pros (such as stability, wide
              networks, and diverse products) and cons (like fees, customer
              satisfaction, and technology adoption) to help users make informed
              decisions. <h1>Property and Rent</h1> This section gives users an
              idea of average rent and purchase prices for apartments in
              different areas (city centre vs outside city centre). It helps
              users gauge housing costs and make better budgeting decisions.{' '}
              <h1>Tax Brackets</h1> This page outlines the different income tax
              brackets and the applicable tax rates for each bracket, helping
              users understand how much tax they need to pay based on their
              income. <h1>Utility Prices</h1> Provides information about the
              average cost of basic utilities (like electricity, water, heating,
              and garbage collection), mobile phone plans, and internet
              services. This helps users anticipate monthly living costs.{' '}
              <h1>Transport Prices</h1> This section offers a breakdown of
              transport-related expenses, including one-way tickets, monthly
              passes, and taxi fares. It gives users a better idea of their
              commuting and travel costs.
            </p>
            <div>
              <Image src={insights1} width={642} height={535} alt="insights1" />
            </div>
          </div>
        );
      case 'Comparisons':
        return (
          <div className="w-full max-h-[80vh] overflow-y-auto overflow-hidden break-words">
            <h2 className="text-lg font-bold text-blue-500">Comparisons</h2>
            <p className="text-s text-gray-500">
              The comparisons page takes a user's information such as job and
              age, this information is then used to provide some comparisons
              between the users. These include monthly income and average
              spending between users within the same bracket. Click on user info
              button and enter your date of birth, job type and industry.
            </p>
            <p className="text-s text-gray-500">
              Click on the user Info button
            </p>
            <Image
              src={comparison1}
              width={642}
              height={535}
              alt="comparison1"
            />
            <p className="text-s text-gray-500">
              Enter the date of birth, job type and industry information
            </p>
            <Image
              src={comparison2}
              width={642}
              height={535}
              alt="comparison2"
            />
            <p className="text-s text-gray-500">
              Browse at the comparisons with other users in your bracket.
            </p>
            <Image
              src={comparison3}
              width={642}
              height={535}
              alt="comparison3"
            />
          </div>
        );
      case 'troubleshooting':
        return (
          <div className="max-w-full">
            <h2 className="text-lg font-bold text-blue-500">Troubleshooting</h2>
            <p className="text-s text-gray-500">
              <strong>Cannot Log In:</strong> Ensure your internet connection is
              stable and retry.
            </p>
            <p className="text-s text-gray-500">
              <strong>App Crashes:</strong> Refresh the page or log out and log
              back in.
            </p>
          </div>
        );
      case 'support':
        return (
          <div className="max-w-full">
            <h2 className="text-lg font-bold text-blue-500">Contact Support</h2>
            <p className="text-s text-gray-500">
              For further assistance, contact our support team at
              Technocrats.301@gmail.com
            </p>
          </div>
        );
      case 'legal':
        return (
          <div className="max-w-full">
            <h2 className="text-lg font-bold text-blue-500">Legal</h2>
            <p className="text-s text-gray-500">
              By using this app, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <>
      {/* <div className="w-[calc(100%-5rem)] md:w-[calc(100%-15rem)] h-full fixed right-0 top-0 flex flex-col bg-[var(--block-background)]"></div> */}
      <div className="w-[calc(100%-5rem)] md:w-[calc(100%-15rem)] h-full fixed right-0 top-0 flex flex-col bg-[var(--block-background)] p-8">
        <div className="pageTitle">
          <span
            className="material-symbols-outlined cursor-pointer"
            style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}
            onClick={props.onClose}
          >
            arrow_back
          </span>
          Usage Guidance
        </div>
        <section className="bg-white p-6 rounded-[2rem] shadow-lg mt-4">
          <div className={styles.helpPage}>
            <nav className={styles.nav}>
              <ul>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('introduction')}
                >
                  Introduction
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('Overview')}
                >
                  Overview
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('Account Setup:')}
                >
                  Account SetUp
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('Accounts')}
                >
                  Accounts
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('Transactions')}
                >
                  Transactions
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('Goals')}
                >
                  Goals
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('Comparisons')}
                >
                  Comparisons
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('Insights')}
                >
                  Insights
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('legal')}
                >
                  Legal
                </li>
              </ul>
            </nav>
            <div className={styles.content}>{renderContent()}</div>
          </div>
        </section>
      </div>
    </>
  );
}
export default HelpModal;
