'use client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Landing.module.css';
import { Fragment, useState } from 'react';
import SignInModal from '../sign-in-modal/SignInModal';
import Image from 'next/image';
import logo from '../../../public/images/BudgieNoBG.png';

/* eslint-disable-next-line */
export interface LandingProps {}

export function Landing(props: LandingProps) {
  return (
    <div className="flex items-center justify-center min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-b " />
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
        onClick={() => {}}
        className=" text-lg absolute top-4 right-4 w-[116px] h-[47px] font-TripSans font-bold bg-white hover:bg-BudgieBlue hover:text-BudgieWhite text-BudgieBlue border-4 border-BudgieBlue transition-colors ease-in hover:border-BudgieGrayLight rounded-full "
      >
        Sign In
      </button>
      <div className="absolute bottom-4 w-full text-center">
        <button className="text-blue-950 font-semibold flex items-center justify-center mx-auto">
          <span className="text-xl font-TripSans font-bold ml-4 animate-bounce">
            {' '}
            Learn More &darr;
          </span>
        </button>
      </div>
    </div>
  );
}

export default Landing;
