'use client';

import styles from './SignUpPage.module.css';
import SignUpModal from '../sign-up-modal/SignUpModal';

/* eslint-disable-next-line */
export interface SignUpPageProps {}

export function SignUpPage(props: SignUpPageProps) {
  return (
    <>
      <div className={styles.singUpPageContainer}  data-testid="signup-page-container">
        <div className={styles.waveTop}></div>
        <div className={styles.waveBottom}></div>
        <div className="z-20 absolute w-screen h-screen "></div>
        <div className="absolute z-50 left-[calc(50vw-397px)] top-[calc(50vh-260px)]">
          <SignUpModal></SignUpModal>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
