'use client';

import styles from './SignUpPage.module.css';
import SignUpModal from '../sign-up-modal/SignUpModal';

/* eslint-disable-next-line */
export interface SignUpPageProps {}

export function SignUpPage(props: SignUpPageProps) {
  return (
    <>
      <div className="absolute z-40 w-screen h-screen backdrop-blur-sm flex flex-col items-center justify-center">
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <SignUpModal></SignUpModal>
        </div>
      </div>

      {/* Wave effect background  bottom */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-none h-[300px] md:h-[400px] z-0">
        <svg
          className="relative block w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="waveGradient"
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
            fill="url(#waveGradient)"
            d="M0,256L48,240C96,224,192,192,288,170.7C384,149,480,139,576,149.3C672,160,768,192,864,192C960,192,1056,160,1152,128C1248,96,1344,64,1392,48L1440,32V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"
          ></path>
        </svg>
      </div>

      {/* Wave effect background  top */}
      <div className="absolute top-0 w-full overflow-hidden leading-none h-[300px] md:h-[400px] z-0">
        <svg
          className="relative block w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ transform: 'rotate(180deg)' }}
        >
          <defs>
            <linearGradient id="waveGradientTop" x1="0%" y1="0%" x2="100%">
              <stop offset="0%" style={{ stopColor: '#a0e9af' }} />
              <stop offset="50%" style={{ stopColor: '#c0f0c0' }} />
              <stop offset="75%" style={{ stopColor: '#b2f5a8' }} />
              <stop offset="100%" style={{ stopColor: '#e0f8d1' }} />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradientTop)"
            d="M0,256L48,240C96,224,192,192,288,170.7C384,149,480,139,576,149.3C672,160,768,192,864,192C960,192,1056,160,1152,128C1248,96,1344,64,1392,48L1440,32V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"
          ></path>
        </svg>
      </div>
    </>
  );
}

export default SignUpPage;
