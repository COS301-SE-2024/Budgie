'use client';

import { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDataContext } from '../data-context/DataContext';
import styles from '../dashboard/Dashboard.module.css';

/* eslint-disable-next-line */
export interface NavbarProps {}

function signout() {
  const auth = getAuth();
  signOut(auth);
}

function getFirstSubstring(url: string) {
  const parts = url.split('/').filter((part) => part !== '');
  return parts.length > 0 ? parts[0] : '';
}

export function NewNavbar(props: NavbarProps) {
  const pathname = usePathname();
  const [selectedItem, setSelectedItem] = useState<string>(
    getFirstSubstring(pathname)
  );
  const { data, refreshData, loading } = useDataContext();

  useEffect(() => {
    setSelectedItem(getFirstSubstring(pathname));
    if (
      !data.accounts.length &&
      !data.goals.length &&
      !data.transactions.length
    ) {
      refreshData();
    }
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex h-screen fixed z-20 w-full top-0 left-0">
        <div className="w-[5rem] min-w-[5rem] md:w-[15rem] md:min-w-[15rem] bg-[var(--block-background)] h-full [box-shadow:0_0_10px_rgba(0,0,0,0.5)] pt-6 z-[100]">
          <ul className="mr-4 ml-4">
            {/* Overview item */}
            <Link href={'/overview'}>
              <li
                className={getNavItemClasses('overview')}
                onClick={() => setSelectedItem('overview')}
              >
                <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
                  home
                </span>
                <span className="hidden md:inline">Overview</span>
              </li>
            </Link>
            {/* Accounts item */}
            <Link href={'/accounts'}>
              <li
                className={getNavItemClasses('accounts')}
                onClick={() => setSelectedItem('accounts')}
              >
                <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
                  account_balance
                </span>
                <span className="hidden md:inline">Accounts</span>
              </li>
            </Link>
            {/* Transactions item */}
            <Link href={'/transactions'}>
              <li
                className={getNavItemClasses('transactions')}
                onClick={() => setSelectedItem('transactions')}
              >
                <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
                  receipt_long
                </span>
                <span className="hidden md:inline">Transactions</span>
              </li>
            </Link>
            {/* Planning item */}
            <Link href={'/planning'}>
              <li
                className={getNavItemClasses('planning')}
                onClick={() => setSelectedItem('planning')}
              >
                <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
                  browse_activity
                </span>
                <span className="hidden md:inline">Planning</span>
              </li>
            </Link>
            {/* Settings item */}
            <Link href={'/settings'}>
              <li
                className={getNavItemClasses('settings')}
                onClick={() => setSelectedItem('settings')}
              >
                <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
                  settings
                </span>
                <span className="hidden md:inline">Settings</span>
              </li>
            </Link>
            {/* Logout item */}
            <li
              className="fixed bottom-4 w-[13vw] font-medium [font-family:'Trip Sans',_sans-serif] flex items-center rounded-[0.4rem] h-8 cursor-pointer text-[var(--main-text)] p-[calc(0.2rem_*_var(--font-size-multiplier))] text-[min(2rem,calc(1.2rem_*_var(--font-size-multiplier)))] hover:bg-[var(--hover)] transition duration-300 ease"
              onClick={signout}
            >
              <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] text-[min(2rem,calc(1.2rem_*_var(--font-size-multiplier)))]">
                logout
              </span>
              <span className="hidden md:inline">Logout</span>
            </li>
          </ul>
        </div>

        <div className="flex-1 h-full w-full flex flex-col items-center justify-center bg-[var(--main-background)]">
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
          </div>
          <div className={styles.loaderText}>Loading...</div>
        </div>
      </div>
    );
  }

  // Function to generate class names for nav items
  function getNavItemClasses(itemName: string) {
    const baseClasses =
      "mt-4 font-medium [font-family:'Trip Sans',_sans-serif] flex items-center rounded-[0.4rem] cursor-pointer text-[var(--main-text)] p-[calc(0.2rem_*_var(--font-size-multiplier))] text-[min(2rem,calc(1.2rem_*_var(--font-size-multiplier)))] hover:bg-[var(--hover)] transition duration-300 ease";
    const selectedClasses =
      'bg-[var(--primary-1)] text-[var(--secondary-text)] hover:bg-[var(--primary-1)]';
    return `${baseClasses} ${selectedItem === itemName ? selectedClasses : ''}`;
  }

  return (
    <div className=" w-[5rem] min-w-[5rem] md:w-[15rem] md:min-w-[15rem] bg-[var(--block-background)] h-full [box-shadow:0_0_10px_rgba(0,0,0,0.5)] pt-6 z-[100]">
      <ul className="mr-4 ml-4">
        {/* Overview item */}
        <Link href={'/overview'}>
          <li
            className={getNavItemClasses('overview')}
            onClick={() => setSelectedItem('overview')}
          >
            <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
              home
            </span>
            <span className="hidden md:inline">Overview</span>
          </li>
        </Link>
        {/* Accounts item */}
        <Link href={'/accounts'}>
          <li
            className={getNavItemClasses('accounts')}
            onClick={() => setSelectedItem('accounts')}
          >
            <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
              account_balance
            </span>
            <span className="hidden md:inline">Accounts</span>
          </li>
        </Link>
        {/* Transactions item */}
        <Link href={'/transactions'}>
          <li
            className={getNavItemClasses('transactions')}
            onClick={() => setSelectedItem('transactions')}
          >
            <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
              receipt_long
            </span>
            <span className="hidden md:inline">Transactions</span>
          </li>
        </Link>
        {/* Planning item */}
        <Link href={'/planning'}>
          <li
            className={getNavItemClasses('planning')}
            onClick={() => setSelectedItem('planning')}
          >
            <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
              browse_activity
            </span>
            <span className="hidden md:inline">Planning</span>
          </li>
        </Link>
        {/* Settings item */}
        <Link href={'/settings'}>
          <li
            className={getNavItemClasses('settings')}
            onClick={() => setSelectedItem('settings')}
          >
            <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] font-[500] text-[min(2rem,calc(1.5rem_*_var(--font-size-multiplier)))]">
              settings
            </span>
            <span className="hidden md:inline">Settings</span>
          </li>
        </Link>
        {/* Logout item */}
        <li
          className="fixed bottom-4 w-[13vw] font-medium [font-family:'Trip Sans',_sans-serif] flex items-center rounded-[0.4rem] h-8 cursor-pointer text-[var(--main-text)] p-[calc(0.2rem_*_var(--font-size-multiplier))] text-[min(2rem,calc(1.2rem_*_var(--font-size-multiplier)))] hover:bg-[var(--hover)] transition duration-300 ease"
          onClick={signout}
        >
          <span className="material-symbols-outlined mr-[0.3rem] ml-[0.3rem] mb-[0.2rem] text-[min(2rem,calc(1.2rem_*_var(--font-size-multiplier)))]">
            logout
          </span>
          <span className="hidden md:inline">Logout</span>
        </li>
      </ul>
    </div>
  );
}

export default NewNavbar;
