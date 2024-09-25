'use client';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import SignInModal from '../sign-in-modal/SignInModal';
import LearnModal from '../learn-more-modal/LearnMore';
import styles from './Landing.module.css'; // Import your CSS module

/* eslint-disable-next-line */
export interface LandingProps {}

export function Landing(props: LandingProps) {
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [showLearnMore, setShowLearnMore] = useState<boolean>(false);

  return (
    <>
      {showSignInModal && (
        <div
          onClick={() => {
            setShowSignInModal(!showSignInModal);
          }}
          className="absolute z-40 w-screen h-screen backdrop-blur-sm flex flex-col items-center justify-center"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <SignInModal></SignInModal>
          </div>
        </div>
      )}
      {showLearnMore && (
        <>
          <div
            onClick={() => {
              setShowLearnMore(!showLearnMore);
            }}
            className="absolute z-40 w-screen h-screen backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <LearnModal onClose={() => setShowLearnMore(false)} />
            </div>
          </div>
        </>
      )}
      <button
        onClick={() => {
          setShowSignInModal(!showSignInModal);
        }}
        className="z-30 text-lg absolute top-4 right-4 w-[116px] h-[47px] font-TripSans font-bold bg-white hover:bg-BudgieBlue hover:text-BudgieWhite text-BudgieBlue border-4 border-BudgieBlue transition-colors ease-in hover:border-BudgieGrayLight rounded-full "
      >
        Sign In
      </button>
      <div className="absolute bottom-4 w-full text-center z-30">
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
      </div>
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="font-TripSans font-extrabold text-8xl md:text-[128px] text-BudgieBlue opacity-[5%] relative -mb-14 z-30">
            Budgie
          </h1>
          <h1 className="font-TripSans font-extrabold text-8xl md:text-[128px] text-BudgieBlue opacity-[13%] relative -mb-14 z-30">
            Budgie
          </h1>
          <h1 className="font-TripSans font-extrabold text-8xl md:text-[128px] text-BudgieBlue relative z-30">
            Budgie
          </h1>
          <p className="font-TripSans font-extrabold text-xl md:text-1x4 text-BudgieBlue mt-4 z-30">
            Financial Wingman
          </p>
        </div>
      </div>

      {/* Wave effect background bottom */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-none h-[300px] md:h-[400px] z-0">
        <svg
          className="relative block w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="waveGradientBottomLarge"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" style={{ stopColor: '#a0e9af' }} />
              <stop offset="50%" style={{ stopColor: '#c0f0c0' }} />
              <stop offset="75%" style={{ stopColor: '#b2f5a8' }} />
              <stop offset="100%" style={{ stopColor: '#e0f8d1' }} />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradientBottomLarge)"
            d="M0,256L48,240C96,224,192,192,288,170.7C384,149,480,139,576,149.3C672,160,768,192,864,192C960,192,1056,160,1152,128C1248,96,1344,64,1392,48L1440,32V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"
          ></path>
        </svg>
      </div>
      <div className="absolute bottom-0 w-full overflow-hidden leading-none h-[200px] md:h-[300px] z-10">
        <svg
          className="relative block w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="waveGradientBottomSmall"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" style={{ stopColor: '#e0f8d1' }} />
              <stop offset="50%" style={{ stopColor: '#a0e9af' }} />
              <stop offset="75%" style={{ stopColor: '#a0e9af' }} />
              <stop offset="100%" style={{ stopColor: '#e0f8d1' }} />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradientBottomSmall)"
            d="M0,256L48,240C96,224,192,192,288,170.7C384,149,480,139,576,149.3C672,160,768,192,864,192C960,192,1056,160,1152,128C1248,96,1344,64,1392,48L1440,32V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"
          ></path>
        </svg>
      </div>

      {/* Wave effect background top */}
      <div className="absolute top-0 w-full overflow-hidden leading-none h-[300px] md:h-[400px] z-0">
        <svg
          className="relative block w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ transform: 'rotate(180deg)' }}
        >
          <defs>
            <linearGradient
              id="waveGradientTopLarge"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" style={{ stopColor: '#a0e9af' }} />
              <stop offset="50%" style={{ stopColor: '#c0f0c0' }} />
              <stop offset="75%" style={{ stopColor: '#b2f5a8' }} />
              <stop offset="100%" style={{ stopColor: '#e0f8d1' }} />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradientTopLarge)"
            d="M0,256L48,240C96,224,192,192,288,170.7C384,149,480,139,576,149.3C672,160,768,192,864,192C960,192,1056,160,1152,128C1248,96,1344,64,1392,48L1440,32V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"
          ></path>
        </svg>
      </div>
      <div className="absolute top-0 w-full overflow-hidden leading-none h-[200px] md:h-[300px] z-10">
        <svg
          className="relative block w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ transform: 'rotate(180deg)' }}
        >
          <defs>
            <linearGradient
              id="waveGradientTopSmall"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              {/* Corrected stopColor values */}
              <stop offset="0%" style={{ stopColor: '#e0f8d1' }} />
              <stop offset="50%" style={{ stopColor: '#a0e9af' }} />
              <stop offset="75%" style={{ stopColor: '#a0e9af' }} />
              <stop offset="100%" style={{ stopColor: '#e0f8d1' }} />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradientTopSmall)"
            d="M0,256L48,240C96,224,192,192,288,170.7C384,149,480,139,576,149.3C672,160,768,192,864,192C960,192,1056,160,1152,128C1248,96,1344,64,1392,48L1440,32V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"
          ></path>
        </svg>
      </div>
    </>
  );
}

export default Landing;
