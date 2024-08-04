'use client';
import { useState } from 'react';
import firebase_admin from 'firebase-admin';
import styles from './forgot-password.module.css';
import Image from 'next/image';
import logo from '../../../public/images/BudgieNoBG.png';
import { sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { getAuth } from 'firebase-admin/auth';

/* eslint-disable-next-line */
export interface ForgotPasswordProps {}

export function ForgotPassword(props: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  async function Sendmail() {
    if (!validateEmail(email)) {
      setError(true);
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    const auth = getAuth();
    const actionCodeSettings = {
      url: 'http://localhost',
      handleCodeInApp: false,
    };
    try {
      auth.generatePasswordResetLink(email, actionCodeSettings).then((link) => {
        return sendPasswordResetEmail(email, '', link);
      });
      setSent(true);
      setError(false);
    } catch (e) {
      setError(true);
      setErrorMessage('Error: email link not sent');
    }
  }

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
          <div>
            <input
              className="appearance-none text-lg w-72 h-10 font-TripSans font-normal pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow"
              id="email"
              name="email"
              type="text"
              onChange={handleChange}
              placeholder="Email"
            ></input>
          </div>

          <div className="pt-4 hidden">Date Picker?</div>
          <div className="flex flex-col justify-start pt-6 items-center">
            <button
              className=" font-TripSans font-medium rounded-[25px] w-36 h-10 bg-BudgieBlue text-BudgieWhite"
              type="button"
              onClick={Sendmail}
            >
              Confirm
            </button>
          </div>
          {error && (
            <div className="pt-2 text-red-600 font-TripSans font-medium">
              {errorMessage}
            </div>
          )}
          {sent && (
            <div className="pt-2 text-red-600 font-TripSans font-medium">
              The email reset email has been sent to your email {email}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
