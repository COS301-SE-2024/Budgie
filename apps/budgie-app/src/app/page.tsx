'use client';
import styles from './page.module.css';
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';

import { Landing } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';
import { UserContext } from '@capstone-repo/shared/budgie-components';

export default function Index() {
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

  return <>{!loading && <Landing></Landing>}</>;
}
