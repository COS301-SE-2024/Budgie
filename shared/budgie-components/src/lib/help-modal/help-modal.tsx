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
        <section></section>
      </div>
    </>
  );
}
export default HelpModal;
