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
import { faRandom } from '@fortawesome/free-solid-svg-icons';


const monthDays = [
  "31", "27", "31", "30", "31", "30",
  "31", "31", "30", "31", "30", "31"
];

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
  const a = query(collection(db, `accounts`), where('uid', '==', uid), where('type', '==', 'current'));
  const result = await getDocs(a);
  
  result.forEach(doc => {
    accounts.push(doc.data());
  });

  return accounts;
}

//get all transaction for this year for an account
export async function getTransactions(accountNumber:string) {
  let uid = getUser();
  const now = new Date();
  let transactions:any = [];

  const q = query(
    collection(db, `transaction_data_${now.getFullYear()}`),
    where('uid', '==', uid),
    where('account_number', '==', accountNumber)
  );
  const result = await getDocs(q);

  result.forEach(doc => {
    const data = doc.data();
    for (let key in data) {
      if (typeof data[key] === 'string') {
        try {
          const monthlyTransactions = JSON.parse(data[key]);
          if (Array.isArray(monthlyTransactions)) {
            transactions = transactions.concat(monthlyTransactions);
          }
        } catch (e) {
          console.error('Error parsing JSON for key:', key, e);
        }
      } else if (Array.isArray(data[key])) {
        transactions = transactions.concat(data[key]);
      }
    }
  });

  return transactions;
}


export async function getMonthlyIncome(transactions:any){
  let balance = 0;

  for(let i=0; i<transactions.length; i++){
    const dateString = transactions[i].date;
    const parts = dateString.split('/');
    const month = parseInt(parts[1], 10);
    if(month==7 && transactions[i].amount>0){
      balance += transactions[i].amount;
    }
  }
  return balance;
}


