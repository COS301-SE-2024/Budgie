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
      <div className="mainPage">
        <div className="pageTitle">Support Settings</div>

        <section className="container mx-auto py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-[2rem] shadow-md">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  <span className="text-2xl font-bold">?</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Getting Started
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                Get your account set up in just a few simple steps.
              </p>
              <div className="flex justify-center items-center">
                <button
                  className=" bg-blue-950 BudgieBlue px-4 py-2 rounded-full shadow-lg text-white"
                  onClick={() => {
                    setHelpModal(!showHelpModal);
                  }}
                >
                  Usage Guidance
                </button>
              </div>
              {showHelpModal && (
                <HelpModal onClose={handleCloseHelp}></HelpModal>
              )}
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-md hover: ">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  <span className="text-2xl font-bold">😕</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Frequently Asked Questions
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                Frequently asked questions from users of the website
              </p>
              <div className="flex items-center justify-center">
                <button
                  className=" bg-blue-950 BudgieBlue px-4 py-2 rounded-full shadow-lg text-white"
                  onClick={() => {
                    setFaqModal(!showFaqModal);
                  }}
                >
                  FAQs
                </button>
              </div>
              {showFaqModal && <FaqModal onClose={handleCloseFaq}></FaqModal>}
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-md">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  <span className="text-2xl font-bold">📢</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                Contact Us
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                Budgie support contact information
              </p>
              {!showContact && (
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => {
                      setShowContact(!showContact);
                    }}
                    className=" bg-blue-950 BudgieBlue px-4 py-2 text-white rounded-full shadow-lg"
                  >
                    Contact
                  </button>
                </div>
              )}
              {showContact && (
                <>
                  <p className=" text-BudgieBlue2 text-center">
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
