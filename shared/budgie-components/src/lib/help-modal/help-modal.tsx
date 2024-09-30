'use client';
import React, { useState } from 'react';
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
      case 'gettingStarted':
        return (
          <div className="max-w-full">
            <h2 className="text-lg font-bold text-blue-500">Getting Started</h2>
            <p className="text-s text-gray-500">
              <strong>Installation:</strong> The app is hosted online so just go
              to the webpage and sign up.
            </p>
            <p className="text-s text-gray-500">
              <strong>Account Setup:</strong> Open the app and tap 'Sign Up' to
              create a new account by entering your email and password. Sign in
              either using google or using your email and password.
            </p>
            <p className="text-s text-gray-500">
              <strong>Add Bank Account</strong> Click on Accounts Tab and then
              click on Add Account pane. Choose from the three options the type
              of account you want to add. Upload a csv to begin the tracking of
              your data. Enter an alias for the account you just added to make
              it distinct. Click on the "Add Account" button and now the account
              is being tracked.
            </p>
            <p className="text-s text-gray-500">
              <strong>Transactions</strong> Once an account is added and a csv
              provided, the transactions for the account are visible on this
              page. Each transaction is categorized and placed as either an
              expense or income. The transactions can be manually categorized by
              clicking on the transaction and manually choosing a category. It's
              possible to traverse the transactions of different accounts by
              choosing to view another account by clicking on it's alias name.
              The transactions can be viewed yearly or monthly based on
              preference.
            </p>
            <p className="text-s text-gray-500">
              <strong>Overview</strong> The overview page provides a summary of
              the bank account information and the results obtained from
              analyzing this data. It provided a quick glimpse at information
              such as the last transaction, your average spending and spending
              by category.
            </p>
            <p className="text-s text-gray-500">
              <strong>Goals</strong> The goals page allows a user to set a goal
              that they would like to obtain, by setting a interval to achieve
              that goal. The goal can either be a "savings","limit spending" and
              "debt reduction" goal. The goal can either be updated manually or
              automatically using the uploaded transaction data. There can be
              conditions to the goal such as only a specific category od
              transactions being noticed.
            </p>
            <p className="text-s text-gray-500">
              <strong>Comparisons</strong> The comparisons page takes a user's
              information such as job and age, this information is then used to
              provide some comparisons between the users. These include monthly
              income and average spending between users within the same bracket.
              Click on user info button and enter your date of birth, job type
              and industry.
            </p>
            <p className="text-s text-gray-500">
              <strong>Insights</strong> <h1>Petrol Prices</h1> This section
              provides an overview of fuel prices, including 95 Unleaded, 93
              Unleaded, and Diesel 50ppm, for both coastal and inland regions.
              Users can track price changes from the previous month, current
              month, and upcoming month. <h1>Bank Insights</h1> Here, users can
              view information about different banks. It outlines the pros (such
              as stability, wide networks, and diverse products) and cons (like
              fees, customer satisfaction, and technology adoption) to help
              users make informed decisions. <h1>Property and Rent</h1> This
              section gives users an idea of average rent and purchase prices
              for apartments in different areas (city centre vs outside city
              centre). It helps users gauge housing costs and make better
              budgeting decisions. <h1>Tax Brackets</h1> This page outlines the
              different income tax brackets and the applicable tax rates for
              each bracket, helping users understand how much tax they need to
              pay based on their income. <h1>Utility Prices</h1> Provides
              information about the average cost of basic utilities (like
              electricity, water, heating, and garbage collection), mobile phone
              plans, and internet services. This helps users anticipate monthly
              living costs. <h1>Transport Prices</h1> This section offers a
              breakdown of transport-related expenses, including one-way
              tickets, monthly passes, and taxi fares. It gives users a better
              idea of their commuting and travel costs.
            </p>
          </div>
        );
      case 'coreFeatures':
        return (
          <div className="w-full overflow-hidden break-words">
            <h2 className="text-lg font-bold text-blue-500">Core Features</h2>
            <p className="text-s text-gray-500">
              <strong>Bank Account linking:</strong> You can link multiple bank
              accounts to the account and get up to date information on your
              spending
            </p>
            <p className="text-s text-gray-500">
              <strong>Predictions:</strong> Budgie provides predictions for
              items that the user commonly spends on such as petrol. This allows
              the user to gain more insight into how much they are spending.
            </p>
            <p className="text-s text-gray-500">
              <strong>Visualization:</strong> Budgie provides visualization of
              the spending patterns of the user.
            </p>
            <p className="text-s text-gray-500">
              <strong>Goal tracking:</strong> The goal tracking allows users to
              set the goals for their spending and provide alerts when this is
              met.
            </p>
          </div>
        );
      case 'tips':
        return (
          <div className="w-full overflow-hidden break-words">
            <h2 className="text-lg font-bold text-blue-500">Tips</h2>
            <p className="text-s text-gray-500">
              <strong>Overview Page:</strong>Provides you with visualizations of
              your data and allows you to see the categizations of your data
              graphically. The page allows you to do same for all the accounts
              you have logged in the app.
            </p>
            <p className="text-s text-gray-500">
              <strong>Accounts Page:</strong>The page allows the addition of
              different kinds of accounts such as current and saving to the user
              account. This allows them to be tracked by the app by uploading
              csvs of the accounts.
            </p>
            <p className="text-s text-gray-500">
              <strong>Transactions Page:</strong>Allows the user to see account
              transactions within a timeframe of a month or year. The
              transactions provided to the user are categorized and can be
              further categorized by the user to show what each transaction was
              for.
            </p>
            <p className="text-s text-gray-500">
              <strong>Planning Page:</strong>Provides a predictions of expected
              income and expenditures based on past spending patterns and
              expected payments. Predictions of common expenses such as petrol
              price are also provided.
            </p>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-full">
            <h2 className="text-lg font-bold text-blue-500">
              Settings and Customization
            </h2>
            <p className="text-s text-gray-500">
              <strong>Display:</strong> Set the theme by toggling between light
              and dark mode. Change the font size and color of the text.
            </p>
            <p className="text-s text-gray-500">
              <strong>Account Setting:</strong> Change the password of your
              account or delete the account entirely.
            </p>
            <p className="text-s text-gray-500">
              <strong>Support:</strong> Access to frequently asked questions as
              well as contact details for additional support.
            </p>
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
                  onClick={() => setSelectedSection('gettingStarted')}
                >
                  Getting Started
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('coreFeatures')}
                >
                  Core Features
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('tips')}
                >
                  Tips
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('settings')}
                >
                  Settings
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('troubleshooting')}
                >
                  Troubleshooting
                </li>
                <li
                  className="!text-BudgieBlue2"
                  onClick={() => setSelectedSection('support')}
                >
                  Contact Support
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
