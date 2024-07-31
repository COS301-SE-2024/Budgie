'use client';

import styles from './support.module.css';
export interface SupportProps {
  onClose: () => void;
}

export function Support(props: SupportProps) {
  return (
    <>
      <section className="bg-indigo-100 py-16">
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
              Get your HelpScout account set up in just 6 simple steps.
            </p>
            <a href="#" class="text-blue-600">
              8 articles
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                <span className="text-2xl font-bold">🔧</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Account Management</h3>
            <p className="text-gray-600 mb-4">
              Managing your account, creating new Users, pricing details,
              exporting data
            </p>
            <a href="#" class="text-blue-600">
              30 articles
            </a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                <span className="text-2xl font-bold">📊</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Reporting</h3>
            <p className="text-gray-600 mb-4">
              Reporting features, metric definitions, use case scenarios
            </p>
            <a href="#" class="text-blue-600">
              11 articles
            </a>
          </div>
        </div>
      </section>

      <div className="fixed bottom-8 right-8">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
          Contact Us
        </button>
      </div>
    </>
  );
}

export default Support;
