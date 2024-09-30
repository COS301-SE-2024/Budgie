'use client';

import { useState, useEffect, createContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../../../../../apps/budgie-app/firebase/clientApp';
import { onAuthStateChanged } from 'firebase/auth';

export const UserContext = createContext<User | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={user}>
      {!loading && children}
    </UserContext.Provider>
  );
};
