'use client';

import './SignInModal.module.css';
import { useState } from 'react';
import Image from 'next/image';
import logo from '../../../public/images/BudgieNoBG.png';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../../../../../apps/budgie-app/firebase/clientApp';

/* eslint-disable-next-line */
export interface SignInModalProps {}

export function SignInModal(props: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User information:', user);
    } catch (error) {
      if (error instanceof Error) {
        const errorCode = (error as any).code;
        const errorMessage = error.message;
        const email = (error as any).customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error as any);
        console.error('Error code:', errorCode);
        console.error('Error message:', errorMessage);
        console.error('Email:', email);
        console.error('Credential:', credential);
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

  const handleLoginClick = async () => {
    if (!email || !password) {
      setError(true);
      setErrorMessage('Please enter both email and password.');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log('User logged in:', user);
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        const errorCode = (error as any).code;
        setError(true);
        switch (errorCode) {
          case 'auth/wrong-password':
            setErrorMessage('Incorrect password.');
            break;
          case 'auth/user-not-found':
            setErrorMessage('No account found with this email.');
            break;
          case 'auth/invalid-email':
            setErrorMessage('This email address is invalid.');
            break;
          case 'auth/invalid-credential':
            setErrorMessage('Invalid Email/Password.');
            break;
          default:
            setErrorMessage(errorMessage);
            break;
        }
        console.error(errorCode, errorMessage);
      } else {
        console.error('Unknown error:', error);
      }
    }
  };

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
                value={email}
                onChange={handleEmailChange}
              ></input>
            </div>
            <div className="pt-4">
              <input
                className="appearance-none text-lg w-72 h-10 font-TripSans font-normal pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow"
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              ></input>
            </div>
            <div className="flex flex-col justify-start pt-6 items-center">
              <button
                className=" font-TripSans font-medium rounded-[25px] w-36 h-10 bg-BudgieBlue text-BudgieWhite"
                type="button"
                onClick={handleLoginClick}
              >
                Log In
              </button>
            </div>
            <div className="flex flex-col justify-start pt-3 items-center">
              <p className=" text-BudgieBlue font-TripSans font-medium  ">OR</p>
            </div>
            <div className="flex flex-col justify-start pt-3 items-center">
              <button
                className="font-TripSans font-medium rounded-[25px] w-36 h-10 bg-BudgieBlue text-BudgieWhite"
                type="button"
                onClick={signInWithGoogle}
              >
                Log In with Google
              </button>
            </div>
            {error && (
              <div className="pt-2 text-red-600 font-TripSans font-medium">
                {errorMessage}
              </div>
            )}
            <div className="flex flex-col justify-start pt-14 items-center">
              <p className=" text-lg text-BudgieBlue font-TripSans font-medium  ">
                Don't have an account?{' '}
                <Link href={'/signup'} className=" underline ">
                  Sign Up
                </Link>
              </p>
            </div>
            <div className="flex flex-col justify-start pt-2 items-center">
              <Link
                href={'#'}
                className="underline text-lg text-BudgieBlue font-TripSans font-medium  "
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignInModal;
