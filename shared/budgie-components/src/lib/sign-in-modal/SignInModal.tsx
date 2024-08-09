'use client';
import { useRouter } from 'next/router';
import './SignInModal.module.css';
import { useState } from 'react';
import Image from 'next/image';
import logo from '../../../public/images/BudgieNoBG.png';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';
import { ForgotPassword } from '../forgot-password/forgot-password';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  getAuth,
} from 'firebase/auth';

/* eslint-disable-next-line */
export interface SignInModalProps {}

export function SignInModal(props: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgot, setForgot] = useState(false);
  const auth = getAuth();
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User information:', user);
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData?.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error('Error code:', errorCode);
        console.error('Error message:', errorMessage);
        console.error('Email:', email);
        console.error('Credential:', credential);
      } else {
        console.error('Unexpected error', error);
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
      const auth = getAuth();
      await setPersistence(auth, browserSessionPersistence);
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
      {forgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div className="relative z-60 bg-white p-6 rounded-lg shadow-lg">
            <ForgotPassword />
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={() => setForgot(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <div className="relative z-10 bg-BudgieBlue w-[794px] h-[521px] rounded-[61px]">
        <div className="flex flex-col justify-start items-center bg-BudgieWhite w-[397px] h-[521px] rounded-[60px] rounded-tr-none rounded-br-none">
          <div className="pt-4 h-[55px] w-[55px]">
            <Image src={logo} alt="Logo" />
          </div>
          <p className="pt-5 font-TripSans font-medium text-3xl text-BudgieBlue">
            Welcome to Budgie
          </p>
          <form className="pt-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <input
                className="appearance-none text-lg w-72 h-10 font-TripSans font-normal pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow"
                id="email"
                type="text"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="pt-4">
              <input
                className="appearance-none text-lg w-72 h-10 font-TripSans font-normal pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow"
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="flex flex-col justify-start pt-6 items-center w-37 h-11">
              <button
                className="font-TripSans font-medium rounded-[25px] w-36 h-10 bg-BudgieBlue text-BudgieWhite"
                type="button"
                onClick={handleLoginClick}
              >
                Log In
              </button>
            </div>
            <div className="flex flex-col justify-start pt-3 items-center">
              <p className="text-BudgieBlue font-TripSans font-medium">OR</p>
            </div>
            <div className="flex flex-col justify-start pt-3 items-center w-50 h-11">
              <button
                className="flex items-center justify-center font-TripSans font-medium rounded-[25px] w-48 h-10 bg-BudgieBlue text-BudgieWhite"
                type="button"
                onClick={signInWithGoogle}
              >
                <img
                  className="w-6 h-6 mr-2"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                />
                Sign In with Google
              </button>
            </div>
            <div className="flex flex-col pt-14 items-center">
              <p className="text-lg text-BudgieBlue font-TripSans font-medium">
                Don't have an account?{' '}
                <Link href={'/signup'} className="underline">
                  Sign Up
                </Link>
              </p>
              <button
                type="button"
                onClick={() => setForgot(!forgot)}
                className="underline text-lg text-BudgieBlue font-TripSans font-medium"
              >
                Forgot Password?
              </button>
            </div>
            {error && (
              <div className="pt-2 w-72 h-10 text-red-600 font-TripSans font-medium">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default SignInModal;
