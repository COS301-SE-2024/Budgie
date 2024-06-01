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
      <div className="bg-BudgieBlue w-[794px] h-[521px] rounded-[61px]">
        <div className="flex flex-col justify-start items-center bg-BudgieWhite w-[397px] h-[521px] rounded-[60px] rounded-tr-none rounded-br-none ">
          <div className=" pt-4 h-[55px] w-[55px]">
            <Image src={logo} alt="Logo"></Image>
          </div>
          <p className="pt-5 font-TripSans font-medium text-3xl text-BudgieBlue">
            Welcome to Budgie
          </p>
          <form className="pt-4">
            <div>
              <input
                className="appearance-none  text-lg w-72 h-10 font-TripSans font-normal pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow"
                id="email"
                type="text"
                placeholder="Email"
              ></input>
            </div>
            <div className="pt-4">
              <input
                className="appearance-none text-lg w-72 h-10 font-TripSans font-normal pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow"
                id="password"
                type="text"
                placeholder="Password"
              ></input>
            </div>
            <div className="flex flex-col justify-start pt-6 items-center">
              <button
                className=" font-TripSans font-medium rounded-[25px] w-36 h-10 bg-BudgieBlue text-BudgieWhite"
                type="button"
              >
                Log In
              </button>
            </div>
            <div className="flex flex-col justify-start pt-3 items-center">
              <p className=" text-BudgieBlue font-TripSans font-medium  ">OR</p>
            </div>
            <div className="flex flex-col justify-start pt-3 items-center">
              {/* google login */}Google login Placeholder
            </div>
            <div className="flex flex-col justify-start pt-14 items-center">
              <p className=" text-lg text-BudgieBlue font-TripSans font-medium  ">
                Don't have an account?{' '}
                <a className=" underline " href="#">
                  Sign Up
                </a>
              </p>
            </div>
            <div className="flex flex-col justify-start pt-2 items-center">
              <a
                className=" underline text-lg text-BudgieBlue font-TripSans font-medium  "
                href="#"
              >
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignInModal;
