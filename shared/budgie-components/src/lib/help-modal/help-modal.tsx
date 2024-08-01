import styles from './help-modal.module.css';

/* eslint-disable-next-line */
export interface HelpModalProps {}

export function HelpModal(props: HelpModalProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to HelpModal!</h1>
    </div>
  );
}

export default HelpModal;
