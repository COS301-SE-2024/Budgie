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
            <h2>Welcome to Budgie</h2>
            <p>
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
              create a new account. Sign in either using google or using your
              email.
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
      <div className="mainPage">
        <div className="pageTitle">
          <span
            className="material-symbols-outlined cursor-pointer"
            style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}
            onClick={props.onClose}
          >
            arrow_back
          </span>
          Usage guidance
        </div>
        <section className=" to-white py-16">
          <div className={styles.helpPage}>
            <nav className={styles.nav}>
              <ul>
                <li onClick={() => setSelectedSection('introduction')}>
                  Introduction
                </li>
                <li onClick={() => setSelectedSection('gettingStarted')}>
                  Getting Started
                </li>
                <li onClick={() => setSelectedSection('coreFeatures')}>
                  Core Features
                </li>
                <li onClick={() => setSelectedSection('tips')}>Tips</li>
                <li onClick={() => setSelectedSection('settings')}>Settings</li>
                <li onClick={() => setSelectedSection('troubleshooting')}>
                  Troubleshooting
                </li>
                <li onClick={() => setSelectedSection('support')}>
                  Contact Support
                </li>
                <li onClick={() => setSelectedSection('legal')}>Legal</li>
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
