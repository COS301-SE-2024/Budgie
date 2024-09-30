'use client';

import { DataProvider } from '../../../../../shared/budgie-components/src/lib/data-context/DataContext';
import { NewNavbar } from '@capstone-repo/shared/budgie-components';
import React, { useContext } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const user = useContext(UserContext);
  return (
    <div className="flex w-full h-full">
      <DataProvider user={user}>
        <NewNavbar />
        {children}
      </DataProvider>
    </div>
  );
}
