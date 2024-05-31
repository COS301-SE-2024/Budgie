'use client';
import styles from './page.module.css';
import React, { useState } from 'react';
import { SignInModal } from '@capstone-repo/shared/budgie-components';
import { Navbar } from '@capstone-repo/shared/budgie-components';
import { Settings } from '@capstone-repo/shared/budgie-components';
import { Homepage } from '@capstone-repo/shared/budgie-components';
import { Dashboard } from '@capstone-repo/shared/budgie-components';
import { Profile } from '@capstone-repo/shared/budgie-components';

export default function Index() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('Home');
  const [selectedItem, setSelectedItem] = useState<string>('Home');

  const handleSignIn = () => {
    setIsSignedIn(true);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedItem(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <Homepage/>;        
      case 'Dashboard':
        return <Dashboard/>;   
      case 'Profile':
        return <Profile/>;   
      case 'Settings':
        return <Settings/>;
      default:
        return <Homepage/>;
    }
  };
  return <>
   <div className={styles.fullPage}>
         {!isSignedIn ? (
           <SignInModal onSignIn={handleSignIn} />
         ) : (
           <>
             <Navbar onNavigate={handleNavigate} selectedItem={selectedItem} />
             {renderPage()}
           </>
         )}
       </div>
  </>
}
