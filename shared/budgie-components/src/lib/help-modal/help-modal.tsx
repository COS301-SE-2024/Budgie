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
          <div>
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
          <div>
            <h2>Getting Started</h2>
            <p>
              <strong>Installation:</strong> The app is hosted online so just go
              to the webpage and sign up.
            </p>
            <p>
              <strong>Account Setup:</strong> Open the app and tap 'Sign Up' to
              create a new account. Sign in either using google or using your
              email.
            </p>
          </div>
        );
      case 'coreFeatures':
        return (
          <div>
            <h2>Core Features</h2>
            <p>
              <strong>Bank Account linking:</strong> You can link multiple bank
              accounts to the account and get up to date information on your
              spending
            </p>
            <p>
              <strong>Predictions:</strong> Budgie provides predictions for
              items that the user commonly spends on such as petrol. This allows
              the user to gain more insight into how much they are spending.
            </p>
            <p>
              <strong>Visualization:</strong> Budgie provides visualization of
              the spending patterns of the user.
            </p>
            <p>
              <strong>Goal tracking:</strong> The goal tracking allows users to
              set the goals for their spending and provide alerts when this is
              met.
            </p>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2>Settings and Customization</h2>
            <p>
              <strong>Display:</strong> Set the theme by toggling between light
              and dark mode. Change the font size and color of the text.
            </p>
            <p>
              <strong>Account Setting:</strong> Change the password of your
              account or delete the account entirely.
            </p>
            <p>
              <strong>Support:</strong> Access to frequently asked questions as
              well as contact details for additional support.
            </p>
          </div>
        );
      case 'troubleshooting':
        return (
          <div>
            <h2>Troubleshooting</h2>
            <p>
              <strong>Cannot Log In:</strong> Ensure your internet connection is
              stable and retry.
            </p>
            <p>
              <strong>App Crashes:</strong> Refresh the page or log out and log
              back in.
            </p>
          </div>
        );
      case 'support':
        return (
          <div>
            <h2>Contact Support</h2>
            <p>
              For further assistance, contact our support team at
              Technocrats.301@gmail.com
            </p>
          </div>
        );
      case 'legal':
        return (
          <div>
            <h2>Legal</h2>
            <p>
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
        <section className="bg-blue-300 py-16">
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
