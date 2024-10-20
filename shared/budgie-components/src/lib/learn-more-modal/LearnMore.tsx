'use client';
import { useRouter } from 'next/router';
import styles from './LearnMore.module.css';
import { Fragment, useState } from 'react';

/* eslint-disable-next-line */
export interface LearnMoreProps {
  onClose: () => void;
}

const LearnMore: React.FC<LearnMoreProps> = ({ onClose }) => {
  return (
    <>
      <div className="bg-BudgieBlue w-[397px] md:w-[794px] md:h-[530px] rounded-[61px] p-8 shadow-2xl">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Learn More About Budgie
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Features & Benefits
            </h3>
            <ul className="list-disc list-inside text-white">
              <li>Track your finances and better understand your spending patterns.</li>
              <li>
                Set goals to acheive financial freedom.
              </li>
              <li>Learn more about the economy and how you are doing financially.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">
              How It Works
            </h3>
            <p className="mb-2  text-white text-sm">
              Follow these simple steps to get started:
            </p>
            <ol className="list-decimal list-inside ml-4 text-white text-sm">
              <li>Sign up for an account.</li>
              <li>Add CSV files of your bank account transaction histories.</li>
              <li>Start managing your finances with ease.</li>
            </ol>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => {
                onClose();
              }}
              className="text-lg w-[116px] h-[47px] font-TripSans font-bold bg-white hover:bg-BudgieGreen1 hover:text-BudgieWhite text-BudgieBlue border-4 border-BudgieBlue transition-colors ease-in hover:border-BudgieGrayLight rounded-full"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnMore;
