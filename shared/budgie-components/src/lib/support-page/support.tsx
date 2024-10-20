'use client';

import { Fragment, useState } from 'react';
import styles from './support.module.css';
import { HelpModal } from '../help-modal/help-modal';
import { FaqModal } from '../faq-modal/faq-modal';
export interface SupportProps {
  onClose: () => void;
}

export function Support(props: SupportProps) {
  const [showContact, setShowContact] = useState<boolean>(false);
  const [showFaqModal, setFaqModal] = useState<boolean>(false);
  const [showHelpModal, setHelpModal] = useState<boolean>(false);

  const handleCloseHelp = () => {
    setHelpModal(false);
  };

  const handleCloseFaq = () => {
    setFaqModal(false);
  };

  return (
    <>
      <div
        className="flex flex-col shadow-lg z-10 fixed top-0 right-0  z-10  bg-[var(--main-background)] p-8 h-full"
        style={{ width: '85vw' }}
      >
        <div className="pageTitle">
          <span
            className="material-symbols-outlined cursor-pointer left-100"
            style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}
            onClick={props.onClose}
          >
            arrow_back
          </span>
          Support Settings
        </div>

        <section className="container mx-auto py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  <span className="text-2xl font-bold">?</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Getting Started</h3>
              <p className="text-gray-600 mb-4">
                Get your account set up in just a few simple steps.
              </p>
              <button
                className=" bg-[var(--primary-1)] BudgieBlue spx-4 py-2 rounded-full shadow-lg text-white p-3"
                onClick={() => {
                  setHelpModal(!showHelpModal);
                }}
              >
                Usage Guidance
              </button>
              {showHelpModal && (
                <HelpModal onClose={handleCloseHelp}></HelpModal>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover: ">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  <span className="text-2xl font-bold">😕</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 ">
                Frequently Asked Questions
              </h3>
              <p className="text-gray-600 mb-4">
                Frequently asked questions from users of the website
              </p>
              <button
                className=" bg-[var(--primary-1)] BudgieBlue px-4 py-2 rounded-full shadow-lg text-white"
                onClick={() => {
                  setFaqModal(!showFaqModal);
                }}
              >
                FAQs
              </button>
              {showFaqModal && <FaqModal onClose={handleCloseFaq}></FaqModal>}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  <span className="text-2xl font-bold">📢</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
              <p className="text-gray-600 mb-4">
                Budgie support contact information
              </p>
              {!showContact && (
                <button
                  onClick={() => {
                    setShowContact(!showContact);
                  }}
                  className=" bg-[var(--primary-1)] BudgieBlue px-4 py-2 rounded-full shadow-lg text-white"
                >
                  Contact
                </button>
              )}
              {showContact && (
                <>
                  <p className=" text-[var(--primary-1)] ">
                    email: Technocrats.301@gmail.com
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Support;
