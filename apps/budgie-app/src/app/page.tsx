'use client';
import styles from './page.module.css';
import React, { useContext, useEffect, useState } from 'react';

import { Landing } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';
import { UserContext } from '@capstone-repo/shared/budgie-components';

export default function Index() {
  const user = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      return router.push('/overview');
    }
  }, [user]);

  return user == null ? <Landing /> : '';
}
