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
import { collection, addDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import Link from 'next/link';

/* eslint-disable-next-line */
export interface SignUpModalProps {}

export function SignUpModal(props: SignUpModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const auth = getAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
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
        console.log('Error code:', errorCode);
        console.log('Error message:', errorMessage);
        console.log('Email:', email);
        console.log('Credential:', credential);
      } else {
        console.log('Unexpected error', error);
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  async function signup() {
    if (!email || !password) {
      setError(true);
      setErrorMessage('Please enter both email and password.');
      console.log(errorMessage);
      return;
    }

    if (!validateEmail(email)) {
      setError(true);
      setErrorMessage('Please enter a valid email address.');
      console.log(errorMessage);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
    } catch (err) {
      if (err instanceof FirebaseError) {
        const errorMessage = err.message;
        const errorCode = err.code;
        setError(true);
        switch (errorCode) {
          case 'auth/weak-password':
            setErrorMessage('The password is too weak.');
            break;
          case 'auth/email-already-in-use':
            setErrorMessage(
              'This email address is already in use by another account.'
            );
            break;
          case 'auth/invalid-email':
            setErrorMessage('This email address is invalid.');
            break;
          case 'auth/operation-not-allowed':
            setErrorMessage('Email/password accounts are not enabled.');
            break;
          default:
            setErrorMessage(errorMessage);
            break;
        }
        if (error) {
          console.log(errorCode);
          console.log(errorMessage);
        }
      } else {
        console.log('Unexpected error', err);
      }
    }
  }

  return (
    <>
      <div className="z-10 bg-BudgieBlue md:w-[794px] h-[521px] md:rounded-r-[60px] rounded-l-[65px] rounded-r-[65px]  shadow-2xl">
        <div className="flex flex-col items-center bg-BudgieWhite w-[397px] h-full rounded-[60px] md:rounded-l-[60px] md:rounded-r-none">
          <div className=" pt-4 h-[55px] w-[55px]">
            <Image src={logo} width={55} height={55} alt="Logo"></Image>
          </div>
          <p className="pt-5 font-TripSans font-medium text-3xl text-BudgieBlue">
            Welcome to Budgie
          </p>
          <form className="pt-4">
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
            <div className="pt-4">
              <input
                className="appearance-none text-lg w-72 h-10 font-TripSans font-normal pl-3 bg-BudgieGrayLight border rounded-[10px] focus:outline-none focus:shadow"
                id="password"
                name="password"
                type="password"
                onChange={handleChange}
                placeholder="Password"
              ></input>
            </div>
            <div className="pt-4 hidden">Date Picker?</div>
            <div className="flex flex-col justify-start pt-6 items-center">
              <button
                className=" font-TripSans font-medium rounded-[25px] w-36 h-10 bg-BudgieBlue text-BudgieWhite"
                type="button"
                onClick={signup}
              >
                Sign Up
              </button>
            </div>
            <div className="flex flex-col justify-start pt-3 items-center">
              <p className=" text-BudgieBlue font-TripSans font-medium  ">OR</p>
            </div>
            <div className="flex flex-col justify-start pt-3 items-center">
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
                Sign Up with Google
              </button>
            </div>
            <div className="flex flex-col justify-start pt-7 items-center">
              <Link
                className=" underline text-lg text-BudgieBlue font-TripSans font-medium  "
                href="/"
              >
                Already Have an Account?
              </Link>
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

export default SignUpModal;
