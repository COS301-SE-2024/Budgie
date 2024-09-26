'use client';

import { NewNavbar } from '@capstone-repo/shared/budgie-components';

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-full">
      <NewNavbar />
      {children}
    </div>
  );
}
