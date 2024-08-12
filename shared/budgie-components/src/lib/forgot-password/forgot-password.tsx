'use client';
import { useState } from 'react';
import styles from './forgot-password.module.css';
import Image from 'next/image';
import logo from '../../../public/images/BudgieNoBG.png';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';

/* eslint-disable-next-line */
export interface ForgotPasswordProps {
  onClose?: () => void;
}

export function ForgotPassword(props: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
    try {
      console.log(`Attempting to send reset email to: ${email}`);
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent successfully');
      setSent(true);
      setError(false);
      setErrorMessage('');
      handleClose();
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      setError(true);
      setErrorMessage(
        error.message || 'An error occurred while sending the reset email.'
      );
    }
  }

  return (
    <>
      <div className="relative z-10 bg-BudgieBlue w-[794px] h-[521px] rounded-[61px] shadow-2xl">
        <div className="flex flex-col justify-start items-center bg-BudgieWhite w-[397px] h-[521px] rounded-[60px] rounded-tr-none rounded-br-none">
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
              The reset email has been sent to {email}.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
