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
      <div className="bg-BudgieBlue w-[397px] md:w-[794px] md:h-[530px] rounded-[61px] p-8 ">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Learn More About Budgie
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Features & Benefits
            </h3>
            <ul className="list-disc list-inside text-white">
              <li>Feature 1: Allow tracking of spending patterns.</li>
              <li>
                Feature 2: Predictive analytics for future spending based on
                past patterns.
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">
              What Our Customers Say
            </h3>
            <p className="italic text-white text-sm">
              "Budgie has transformed the way we manage our finances. Highly
              recommended!" - Happy Customer
            </p>
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
              <li>Link your financial accounts.</li>
              <li>Add CSV files of your bank statements.</li>
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
