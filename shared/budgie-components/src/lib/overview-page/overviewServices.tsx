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

// interface Account {
//   account_number: string;
//   alias: string;
//   name: string;
//   type: string;
//   uid: string;
// }

//get logged in users user id
export function getUser(){
    const auth = getAuth();
    if (auth) {
      const user = auth.currentUser;
      return user?.uid;
    }
}

//get all accounts for user
export async function getAccounts(){
    let uid = getUser();
    const accounts: any = []
    const a = query(collection(db, `accounts`), where('uid', '==', uid));
    const result = await getDocs(a);
    result.forEach(doc => {
      accounts.push(doc.data());
    });
    return accounts;
}