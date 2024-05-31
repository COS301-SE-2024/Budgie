'use client';

import './SignInModal.module.css';
import { Fragment, useState } from 'react';
import Image from 'next/image';
import logo from '../../../public/images/BudgieNoBG.png';

/* eslint-disable-next-line */
export interface SignInModalProps {}

export function SignInModal(props: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <div className="bg-BudgieBlue w-[794px] h-[521px] rounded-[61px] m-5">
        <div className="relative bg-BudgieWhite w-[397px] h-[521px] rounded-[60px] rounded-tr-none rounded-br-none ">
          <div className="h-[55px] w-[55px]">
            <Image src={logo} alt="Logo"></Image>
          </div>
          <p className=" font-TripSans text-3xl text-BudgieBlue">
            Welcome to Budgie
          </p>
          <form></form>
        </div>
      </div>
    </>
  );
}

export default SignInModal;
