'use client';

import { UserContext } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { SpecificAccountPage } from '@capstone-repo/shared/budgie-components';
import { useParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const user = useContext(UserContext);
  const params = useParams();
  const accountNumber = params.account_number as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    !loading && (
      <SpecificAccountPage number={accountNumber}></SpecificAccountPage>
    )
  );
}
