'use client';

import styles from './support.module.css';
export interface SupportProps {
  onClose: () => void;
}

export function Support(props: SupportProps) {
  return (
    <>
      <div className="mainPage">
        <div className="pageTitle">
          <span
            className="material-symbols-outlined cursor-pointer"
            onClick={props.onClose}
            style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}
          >
            arrow_back
          </span>
          Support Settings
        </div>
        <section className="bg-blue-300 py-16">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          </div>
        </section>

        <section className="container mx-auto py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold">Help Desk</h2>
          </div>
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
              <button className=" bg-blue-950 BudgieBlue px-4 py-2 rounded-full shadow-lg">
                Started
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  <span className="text-2xl font-bold">📢</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Announcements</h3>
              <p className="text-gray-600 mb-4">
                Announcements from developers
              </p>
              <button className=" bg-blue-950 BudgieBlue px-4 py-2 rounded-full shadow-lg">
                Announcements
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover: ">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  <span className="text-2xl font-bold">😕</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">FAQ</h3>
              <p className="text-gray-600 mb-4">
                Frequently asked questions from users of the website
              </p>
              <button className=" bg-blue-950 BudgieBlue px-4 py-2 rounded-full shadow-lg">
                FAQs
              </button>
            </div>
          </div>
        </section>

        <div className="fixed bottom-8 right-8">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
            Contact Us
          </button>
        </div>
      </div>
    </>
  );
}

export default Support;
