'use client';

import {
  useState,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
} from 'react';
import { auth } from '../../../../../apps/budgie-app/firebase/clientApp';
import { onAuthStateChanged } from 'firebase/auth';

export const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });

  return (
    <UserContext.Provider value={user}>
      {!loading && children}
    </UserContext.Provider>
  );
};
