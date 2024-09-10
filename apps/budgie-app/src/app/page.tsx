'use client';
import React, { useContext, useEffect, useState } from 'react';
import { Landing } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';
import { UserContext } from '@capstone-repo/shared/budgie-components';

export default function Index() {
  const user = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/overview');
    }
  }, [user, router]);

  // If user is null (not logged in), show the Landing component
  // If user is undefined (still loading), show nothing or a loading indicator
  return user === null ? <Landing /> : user ? null : <div>Loading...</div>;
}
