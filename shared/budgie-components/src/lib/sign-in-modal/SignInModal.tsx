'use client';

import styles from './SignInModal.module.css';
import React from 'react';

/* eslint-disable-next-line */
export interface SignInModalProps {
  onSignIn: () => void;
}

export function SignInModal(props: SignInModalProps) {
  return <>
    <button onClick={props.onSignIn}>Sign In</button>
  </>
}

export default SignInModal;
