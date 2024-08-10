import styles from './help-modal.module.css';

/* eslint-disable-next-line */
export interface HelpModalProps {}

export function HelpModal(props: HelpModalProps) {
  return (
    <>
      <div className="mainPage">
        <div className="pageTitle">
          <span
            className="material-symbols-outlined cursor-pointer"
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
        <section>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-BudgieBlue">
              How It Works
            </h3>
            <p className="mb-2 text-BudgieBlue">
              Follow these simple steps to get started:
            </p>
            <ol className="list-decimal list-inside ml-4 text-BudgieBlue">
              <li>Sign up for an account.</li>
              <li>Link your financial accounts.</li>
              <li>Add CSV files of your bank statements.</li>
              <li>Start managing your finances with ease.</li>
            </ol>
          </div>
        </section>
      </div>
    </>
  );
}
export default HelpModal;
