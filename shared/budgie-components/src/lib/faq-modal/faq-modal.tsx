import styles from './faq-modal.module.css';

/* eslint-disable-next-line */
export interface FaqModalProps {}

export function FaqModal(props: FaqModalProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to FaqModal!</h1>
    </div>
  );
}

export default FaqModal;
