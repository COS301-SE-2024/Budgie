'use client';
import styles from './page.module.css';
import React, { useContext, useEffect, useState } from 'react';
import {
  OverviewPage,
  UserContext,
} from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';

export default function overview() {
  const router = useRouter();

  const user = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [user]);

  return <>{!loading && <OverviewPage></OverviewPage>}</>;
}
