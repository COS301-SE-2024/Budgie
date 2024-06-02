'use client';
import styles from './page.module.css';
import React, { useContext, useEffect, useState } from 'react';
import {
  SignUpPage,
  UserContext,
} from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const user = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/mydashboard');
    } else {
      setLoading(false);
    }
  }, [user]);
  return <>{!loading && <SignUpPage></SignUpPage>}</>;
}
