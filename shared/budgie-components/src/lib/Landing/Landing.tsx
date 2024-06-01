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
    <div className="flex items-center justify-center min-h-screen  bg-BudgieGreen1 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b " />

      <div className="relative z-10 text-center">
        <div className="flex flex-col items-center w-[560px] h-[332px]">
          <h1 className="font-TripSans text-8xl md:text-[128px] text-BudgieBlue absolute top-24 opacity-70">
            Budgie
          </h1>
          <h1 className="font-TripSans text-8xl md:text-[128px] text-BudgieBlue absolute top-10 opacity-40">
            Budgie
          </h1>
          <h1 className="font-TripSans text-8xl md:text-[128px] text-BudgieBlue absolute bottom-12 ">
            Budgie
          </h1>
          <p className="font-TripSans text-xl md:text-1x4 text-BudgieBlue mt-4 absolute bottom-3 right-14">
            Financial Wingman
          </p>
        </div>
      </div>

      <Link
        href="#"
        className="w-[116px] h-[47px] absolute top-4 right-4 bg-white text-BudgieBlue border-2 border-BudgieBlue rounded-full px-6 py-2 font-semibold"
      >
        Sign In
      </Link>
      <div className="absolute bottom-4 w-full text-center">
        <button className="text-blue-950 font-semibold flex items-center justify-center mx-auto">
          Learn More
          <span className="ml-4 animate-bounce">&darr;</span>
        </button>
      </div>
    </div>
  );
}

export default Landing;
