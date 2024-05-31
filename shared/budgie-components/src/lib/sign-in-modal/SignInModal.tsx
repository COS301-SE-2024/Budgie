'use client';

import styles from './SignInModal.module.css';
import React from 'react';

/* eslint-disable-next-line */
export interface SignInModalProps {
  onSignIn: () => void;
}

export function SignInModal(props: SignInModalProps) {
  return <>
    <div className="bg-indigo-500 p-4">Hello SignIn test!</div>
    <button onClick={props.onSignIn}>Sign In</button>
  </>
}

export default SignInModal;
