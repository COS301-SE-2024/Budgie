// comparison-page.tsx
import React, { useEffect, useState } from 'react';
import styles from './comparison-page.module.css';
import {
    getAccounts,
    getTransactions,
    getUser
}from './services';

export interface ComparisonPage {}

export function ComparisonPage(props: ComparisonPage) {

    interface Account {
        account_number: string;
        alias: string;
        name: string;
        type: string;
        uid: string;
      }
    
      interface Transaction {
        date: string;
        amount: number;
        balance: number;
        description: string;
        category: string;
      }
      
    const [accounts, setAccount] = useState<Account[]>([]);
    const [income, setIncome] = useState(0);

    const getData = async () => {
        const accounts = await getAccounts();
        setAccount(accounts);
        let income = 0;
        for(let i=0; i<accounts.length; i++){
            let transaction = await getTransactions(accounts[i].account_number);
            alert(JSON.stringify(transaction));
        }
    }

    useEffect(() => {
        getData();
        alert(accounts[0].alias);
    }, [accounts])

  return (
    <div className={styles.container}>

    </div>
  );
}

export default ComparisonPage;
