'use client';
import { useRouter } from 'next/router';
import styles from './Landing.module.css';
import { Fragment, useEffect, useState } from 'react';
import SignInModal from '../sign-in-modal/SignInModal';
import LearnModal from '../learn-more-modal/LearnMore';

/* eslint-disable-next-line */
export interface LandingProps {}

export function Landing(props: LandingProps) {
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [showLearnMore, setShowLearnMore] = useState<boolean>(false);

  useEffect(() => {
    console.log('ran useffect');
  }, []);

  return (
    <>
      {showSignInModal && (
        <>
          <div
            onClick={() => {
              setShowSignInModal(!showSignInModal);
            }}
            className="z-20 absolute w-screen h-screen backdrop-blur-sm"
          ></div>
          <div className="absolute z-50 left-[calc(50vw-397px)] top-[calc(50vh-260px)]">
            <SignInModal></SignInModal>
          </div>
        </>
      )}
      {showLearnMore && (
        <>
          <div
            onClick={() => {
              setShowLearnMore(!showLearnMore);
            }}
            className="z-20 absolute w-screen h-screen"
          ></div>
          <div className="absolute z-50 left-[calc(50vw-395px)] top-[calc(50vh-260px)]">
            <LearnModal onClose={() => setShowLearnMore(false)} />
          </div>
        </>
      )}
      <div className={styles.landingContainer}>
        <div className={styles.waveTop}></div>
        <div className={styles.waveBottom}></div>
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="absolute inset-0 bg-gradient-to-b " />
          {!showSignInModal && (
            <>
              <div className="relative z-10 text-center">
                <div className="flex flex-col items-center w-[560px] h-[332px]">
                  <h1 className="font-TripSans font-extrabold text-8xl md:text-[128px] text-BudgieBlue absolute top-24 opacity-[13%]">
                    Budgie
                  </h1>
                  <h1 className="font-TripSans font-extrabold text-8xl md:text-[128px] text-BudgieBlue absolute top-10 opacity-5">
                    Budgie
                  </h1>
                  <h1 className="font-TripSans font-extrabold text-8xl md:text-[128px] text-BudgieBlue absolute bottom-12 ">
                    Budgie
                  </h1>
                  <p className="font-TripSans font-extrabold text-xl md:text-1x4 text-BudgieBlue mt-4 absolute bottom-9 right-[28px]">
                    Financial Wingman
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSignInModal(!showSignInModal);
                }}
                className=" text-lg absolute top-4 right-4 w-[116px] h-[47px] font-TripSans font-bold bg-white hover:bg-BudgieBlue hover:text-BudgieWhite text-BudgieBlue border-4 border-BudgieBlue transition-colors ease-in hover:border-BudgieGrayLight rounded-full "
              >
                Sign In
              </button>
            </>
          )}
          <div className="absolute bottom-4 w-full text-center">
            {!showSignInModal && !showLearnMore && (
              <button
                onClick={() => {
                  setShowLearnMore(true);
                }}
                className="text-blue-950 font-semibold flex items-center justify-center mx-auto"
              >
                <span className="text-xl font-TripSans font-bold ml-4 animate-bounce">
                  Learn More &darr;
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Landing;
