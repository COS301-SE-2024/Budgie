'use client';
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

  // Error handling states
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const auth = getAuth();

  // Error messages mapping
  const errorMessages: { [key: string]: string } = {
    'auth/invalid-email': 'The email address is not valid.',
    'auth/user-disabled': 'This user account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Password is incorrect.',
    'auth/network-request-failed': 'Network error. Please try again.',
    'auth/popup-closed-by-user':
      'The popup was closed before completing sign-in.',
    'auth/cancelled-popup-request': 'Cancelled previous popup request.',
    // Add more error codes and messages as needed
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError(false);
      setError(false);
      setErrorMessage('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) {
      setPasswordError(false);
      setError(false);
      setErrorMessage('');
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User information:', user);
      // Handle successful login (e.g., redirect)
      setError(false);
      setErrorMessage('');
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;
        const friendlyMessage =
          errorMessages[errorCode] ||
          'Failed to sign in with Google. Please try again.';
        setError(true);
        setErrorMessage(friendlyMessage);

        console.error('Error code:', errorCode);
        console.error('Error message:', error.message);
      } else {
        console.error('Unexpected error', error);
        setError(true);
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = async () => {
    let valid = true;

    if (!email) {
      setEmailError(true);
      valid = false;
      setError(true);
      setErrorMessage('Please enter your email address.');
    } else if (!validateEmail(email)) {
      setEmailError(true);
      valid = false;
      setError(true);
      setErrorMessage('Please enter a valid email address.');
    } else {
      setEmailError(false);
    }

    if (!password) {
      setPasswordError(true);
      valid = false;
      setError(true);
      setErrorMessage('Please enter your password.');
    } else {
      setPasswordError(false);
    }

    if (!valid) {
      return;
    }

    setLoading(true);

    try {
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log('User logged in:', user);
      // Handle successful login (e.g., redirect)
      setError(false);
      setErrorMessage('');
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;
        const friendlyMessage =
          errorMessages[errorCode] ||
          'An unexpected error occurred. Please try again.';
        setError(true);
        setErrorMessage(friendlyMessage);

        // Set input error states based on error codes
        if (
          errorCode === 'auth/invalid-email' ||
          errorCode === 'auth/user-not-found'
        ) {
          setEmailError(true);
        } else if (errorCode === 'auth/wrong-password') {
          setPasswordError(true);
        }

        console.error('Error code:', errorCode);
        console.error('Error message:', error.message);
      } else {
        console.error('Unknown error:', error);
        setError(true);
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForgot(false);
    setEmail('');
    setPassword('');
    setError(false);
    setErrorMessage('');
    setEmailError(false);
    setPasswordError(false);
  };

  return (
    <>
      {forgot && <ForgotPassword onClose={handleClose} />}
      {!forgot && (
        <div className="z-10 bg-BudgieBlue md:w-[794px] h-[521px] md:rounded-r-[60px] rounded-l-[65px] rounded-r-[65px]  shadow-2xl">
          <div className="flex flex-col items-center bg-BudgieWhite w-[397px] h-full rounded-[60px] md:rounded-l-[60px] md:rounded-r-none">
            <div className="mt-4 h-[55px] w-[55px]">
              <Image src={logo} alt="Logo" />
            </div>

            <p className="mt-2 font-TripSans font-medium text-3xl text-BudgieBlue">
              Welcome to Budgie
            </p>

            <input
              className={`mt-4 appearance-none text-lg w-72 h-10 font-TripSans pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow ${
                emailError ? 'border-red-500' : 'border-transparent'
              }`}
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
            />

            <input
              className={`mt-2 appearance-none text-lg w-72 h-10 font-TripSans pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow ${
                passwordError ? 'border-red-500' : 'border-transparent'
              }`}
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <button
              className={`mt-4 font-TripSans font-medium rounded-[25px] w-36 h-10 ${
                loading ? 'bg-gray-400' : 'bg-BudgieBlue'
              } text-BudgieWhite`}
              type="button"
              onClick={handleLoginClick}
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>

            <p className="mt-2 text-BudgieBlue font-TripSans font-medium">OR</p>

            <button
              className={`mt-2 flex items-center justify-center font-TripSans font-medium rounded-[25px] w-48 h-10 ${
                loading ? 'bg-gray-400' : 'bg-BudgieBlue'
              } text-BudgieWhite`}
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
            >
              <img
                className="w-6 h-6 mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
              />
              {loading ? 'Signing In...' : 'Sign In with Google'}
            </button>

            <p className="mt-4 text-lg text-BudgieBlue font-TripSans font-medium">
              Don't have an account?{' '}
              <Link href="/signup" className="underline">
                Sign Up
              </Link>
            </p>

            <button
              type="button"
              onClick={() => setForgot(!forgot)}
              className="mt-2 underline text-lg text-BudgieBlue font-TripSans font-medium"
              disabled={loading}
            >
              Forgot Password?
            </button>

            {/* Reserve space for the error message */}
            <div className="mt-2 pt-2 w-full text-center text-red-600 font-TripSans font-medium min-h-[24px]">
              {error && errorMessage}
            </div>
          </div>
          {/* Loading Spinner */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 ">
              <div className="w-16 h-16 border-8 border-gray-200 border-t-BudgieBlue rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default SignInModal;
