'use client';
import './SignUpModal.module.css';
import { useState } from 'react';
import Image from 'next/image';
import logo from '../../../public/images/BudgieNoBG.png';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import Link from 'next/link';

/* eslint-disable-next-line */
export interface SignUpModalProps {}

export function SignUpModal(props: SignUpModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Error handling states
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  // Error messages mapping
  const errorMessages: { [key: string]: string } = {
    'auth/weak-password': 'Your password is too weak.',
    'auth/email-already-in-use':
      'This email address is already in use by another account.',
    'auth/invalid-email': 'This email address is invalid.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
    'auth/network-request-failed': 'Network error. Please try again.',
    // Add more error codes and messages as needed
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
      // Handle successful sign-up (e.g., redirect)
      setError(false);
      setErrorMessage('');
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorCode = error.code;
        const friendlyMessage =
          errorMessages[errorCode] ||
          'Failed to sign up with Google. Please try again.';
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

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  async function signup() {
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
    } else if (password.length < 6) {
      setPasswordError(true);
      valid = false;
      setError(true);
      setErrorMessage('The password is too weak.');
    } else {
      setPasswordError(false);
    }

    if (!valid) {
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log('User signed up:', user);
      // Handle successful sign-up (e.g., redirect)
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
          errorCode === 'auth/email-already-in-use'
        ) {
          setEmailError(true);
        } else if (errorCode === 'auth/weak-password') {
          setPasswordError(true);
        }

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
  }

  return (
    <>
      <div className="z-10 bg-BudgieBlue md:w-[794px] h-[521px] md:rounded-r-[60px] rounded-l-[65px] rounded-r-[65px] shadow-2xl">
        <div className="flex flex-col items-center bg-BudgieWhite w-[397px] h-full rounded-[60px] md:rounded-l-[60px] md:rounded-r-none">
          <div className="mt-4 h-[55px] w-[55px]">
            <Image src={logo} width={55} height={55} alt="Logo" />
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
            onClick={signup}
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
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
            {loading ? 'Signing Up...' : 'Sign Up with Google'}
          </button>

          <p className="mt-4 text-lg text-BudgieBlue font-TripSans font-medium">
            Already have an account?{' '}
            <Link href="/" className="underline">
              Log In
            </Link>
          </p>

          {/* Reserve space for the error message */}
          <div className="mt-2 pt-2 w-full text-center text-red-600 font-TripSans font-medium min-h-[24px]">
            {error && errorMessage}
          </div>
        </div>
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25">
            <div className="w-16 h-16 border-8 border-gray-200 border-t-BudgieBlue rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </>
  );
}

export default SignUpModal;
