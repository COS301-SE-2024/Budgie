import { getAuth } from 'firebase/auth';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query, 
  where
} from 'firebase/firestore';


//get logged in users user id
export function getUser(){
    const auth = getAuth();
    if (auth) {
      const user = auth.currentUser;
      return user?.uid;
    }
}

//get all accounts for user
export async function getAccounts() {
  let uid = getUser();
  const accounts:any = [];
  const a = query(collection(db, `accounts`), where('uid', '==', uid));
  const result = await getDocs(a);
  
  result.forEach(doc => {
    accounts.push(doc.data());
  });

  return accounts.reverse();
}

//get all transaction for this year for an account
export async function getTransactions(number:string){
  let uid = getUser();
  const now = new Date();
  let transactions:any = [];

  const a = query(collection(db, `transaction_data_${now.getFullYear()}`), where('uid', '==', uid), where('account_number', '==', number));
  const result = await getDocs(a);

  result.forEach(doc => {
    transactions.push(doc.data());
  });

  return transactions;
}