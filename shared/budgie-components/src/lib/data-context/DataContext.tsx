import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDocs, query, where, collection, Firestore } from 'firebase/firestore';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';

// Interfaces for the data models
export interface Account {
  name: string;
  alias: string;
  type: string;
  account_number: string;
}

export interface Transaction {
  account_number: string;
  date: string;
  amount: number;
  balance: number;
  description: string;
  category: string;
  year: number;

  january?: string;
  february?: string;
  march?: string;
  april?: string;
  may?: string;
  june?: string;
  july?: string;
  august?: string;
  september?: string;
  october?: string;
  november?: string;
  december?: string;
}

export interface Goal {
  id: string;
  name: string;
  type: string;
  initial_amount?: number;
  current_amount: number;
  target_amount?: number;
  target_date?: string;
  spending_limit?: number;
  updates?: string;
  deleted_updates?: string;
  monthly_updates?: string;
  update_type: string;
  last_update?: string;
  conditions?: string;
}

interface YearsUploaded {
  years: string; 
}

export interface UserData {
  accounts: Account[];
  goals: Goal[];
  transactions: Transaction[];
  yearsUploaded: number[];
}

// Define the type for the DataContext
interface DataContextType {
  data: UserData;
  setData: (data: UserData) => void;
  refreshData: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the DataContext
const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}

// Fetch user data function
async function fetchUserData(uid: string): Promise<UserData> {
  // Collection references
  const accountsRef = collection(db, 'accounts');
  const goalsRef = collection(db, 'goals');
  const yearsUploadedRef = collection(db, 'years_uploaded');

  // Build a query for each collection where the uid matches the current user
  const accountsQuery = query(accountsRef, where('uid', '==', uid));
  const goalsQuery = query(goalsRef, where('uid', '==', uid));
  const yearsUploadedQuery = query(yearsUploadedRef, where('uid', '==', uid));

  // Execute the queries
  const [accountsSnapshot, goalsSnapshot, yearsUploadedSnapshot] = await Promise.all([
    getDocs(accountsQuery),
    getDocs(goalsQuery),
    getDocs(yearsUploadedQuery),
  ]);

  // Map over the snapshots to get the data and parse them into the correct types
  const accounts = accountsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as Account));
  const goals = goalsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Goal));
  const yearsUploadedDoc = yearsUploadedSnapshot.docs[0]?.data() as YearsUploaded;
  const yearsUploaded = JSON.parse(yearsUploadedDoc.years).map((year: string) => parseInt(year, 10)); // Parse years as array of numbers

  // Fetch transaction data for the years uploaded
  const transactions = await fetchTransactionData(db, uid, yearsUploaded);

  return {
    accounts,
    goals,
    transactions,
    yearsUploaded,
  };
}

// Fetch transaction data for each year
async function fetchTransactionData(db: Firestore, uid: string, years: number[]): Promise<Transaction[]> {
  const transactionData: Transaction[] = [];

  for (const year of years) {
    const transactionRef = collection(db, `transaction_data_${year}`);
    const transactionQuery = query(transactionRef, where('uid', '==', uid));

    const transactionSnapshot = await getDocs(transactionQuery);
    const transactionsForYear = transactionSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      year, // Attach the year to each transaction
    } as unknown as Transaction));

    transactionData.push(...transactionsForYear); // Collect all transactions
  }

  return transactionData;
}

// Create the provider component and accept `user` as a prop
export const DataProvider = ({ children, user }: { children: React.ReactNode; user: { uid: string } | null }) => {
  const [data, setData] = useState<UserData>({
    accounts: [],
    goals: [],
    transactions: [],
    yearsUploaded: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (user?.uid) {
        const fetchedData = await fetchUserData(user.uid);
        setData(fetchedData);
      } else {
        throw new Error('User not authenticated');
      }
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      refreshData(); // Fetch data on initial render
    }
  }, [user]);

  return (
    <DataContext.Provider value={{ data, setData, refreshData, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};
