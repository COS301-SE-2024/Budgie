'use client';
import { useState } from 'react';
import styles from './forgot-password.module.css';
import Image from 'next/image';
import logo from '../../../public/images/BudgieNoBG.png';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

/* eslint-disable-next-line */
export interface ForgotPasswordProps {
  onClose?: () => void;
}

export function ForgotPassword(props: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  // Error handling states
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false); // New state for email error
  const [sent, setSent] = useState(false);

  const { onClose = () => {} } = props;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (error) {
      setError(false);
      setErrorMessage('');
    }
    if (emailError) {
      setEmailError(false); // Reset email error state
    }
    if (sent) {
      setSent(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Error messages mapping
  const errorMessages: { [key: string]: string } = {
    'auth/invalid-email': 'The email address is not valid.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please try again.',
    // Add more error codes and messages as needed
  };

  async function Sendmail() {
    if (!validateEmail(email)) {
      setEmailError(true); // Set email error state
      setError(true);
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const auth = getAuth();
    try {
      console.log(`Attempting to send reset email to: ${email}`);
      await sendPasswordResetEmail(auth, email);
      setSent(true);
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

        // Set input error state based on error codes
        if (
          errorCode === 'auth/invalid-email' ||
          errorCode === 'auth/user-not-found'
        ) {
          setEmailError(true); // Set email error state
        }

        console.error('Error code:', errorCode);
        console.error('Error message:', error.message);
      } else {
        console.error('Unknown error:', error);
        setError(true);
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  }

  return (
    <>
      <div className="z-10 bg-BudgieBlue md:w-[794px] h-[521px] md:rounded-r-[60px] rounded-l-[65px] rounded-r-[65px] shadow-2xl">
        <div className="flex flex-col items-center justify-center bg-BudgieWhite w-[397px] h-full rounded-[60px] md:rounded-l-[60px] md:rounded-r-none">
          <div className="pt-4 h-[55px] w-[55px]">
            <Image src={logo} alt="Logo" />
          </div>
          <p className="pt-5 font-TripSans font-medium text-3xl text-BudgieBlue">
            Welcome to Budgie
          </p>

          {/* Container to space items vertically */}
          <div className="flex flex-col items-center space-y-4 mt-6">
            <input
              className={`appearance-none text-lg w-72 h-10 font-TripSans font-normal pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow ${
                emailError ? 'border-red-500' : 'border-transparent'
              }`}
              id="email"
              name="email"
              type="text"
              onChange={handleChange}
              placeholder="Email"
            />

            {/* Buttons container */}
            <div className="flex flex-col items-center space-y-4">
              <button
                className="font-TripSans font-medium rounded-[25px] w-36 h-10 bg-BudgieBlue text-BudgieWhite"
                type="button"
                onClick={Sendmail}
              >
                Confirm
              </button>

              <button
                className="font-TripSans font-medium rounded-[25px] w-36 h-10 bg-gray-300 text-BudgieBlue"
                type="button"
                onClick={handleClose}
              >
                Back
              </button>
            </div>

            {/* Reserve space for messages */}
            <div className="min-h-[48px] flex items-center">
              {error && (
                <div className="text-red-600 font-TripSans font-medium text-center">
                  {errorMessage}
                </div>
              )}
              {sent && (
                <div className="text-BudgieBlue font-TripSans font-medium text-center">
                  A reset email has been sent to {email}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
