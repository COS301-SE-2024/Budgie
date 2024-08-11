'use client';
import styles from './page.module.css';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '@capstone-repo/shared/budgie-components';
import { Navbar } from '@capstone-repo/shared/budgie-components';
import { Settings } from '@capstone-repo/shared/budgie-components';
import { Dashboard } from '@capstone-repo/shared/budgie-components';
import { useRouter } from 'next/navigation';

export default function MyDashboard() {
  const [currentPage, setCurrentPage] = useState<string>('Home');
  const [selectedItem, setSelectedItem] = useState<string>('Home');
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

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedItem(page);
  };

  const renderPage = () => {
    return true;
  };

  return (
    <>
      {!loading && (
        <div className={styles.fullPage}>
          <Navbar onNavigate={handleNavigate} selectedItem={selectedItem} />
          {renderPage()}
        </div>
      )}
    </>
  );
}
