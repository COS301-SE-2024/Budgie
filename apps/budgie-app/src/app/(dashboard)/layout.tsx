'use client';

import { NewNavbar } from '@capstone-repo/shared/budgie-components';
import styles from './page.module.css';

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.fullPage}>
      <NewNavbar />
      {children}
    </div>
  );
}
