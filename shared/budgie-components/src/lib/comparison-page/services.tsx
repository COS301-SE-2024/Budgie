import { getAuth } from 'firebase/auth';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import {
  collection,
  doc,
  getDocs,
  getDoc,
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
  const currentMonth = new Date().getMonth();

  for(let i=0; i<transactions.length; i++){
    const dateString = transactions[i].date;
    const parts = dateString.split('/');
    const month = parseInt(parts[1], 10);
    if(month==currentMonth && transactions[i].amount>0){
      balance += transactions[i].amount;
    }
  }
  return balance;
}

export async function getPosition(position : string){
  const stats: (number | null)[] = [null, null, null];

  try {
    const q = query(collection(db, 'job_positions'), where('type', '==', position));
    const result = await getDocs(q);

    if (result.empty) {
      return stats; 
    }

    result.forEach(doc => {
      const data = doc.data(); 
      if (data.minimum !== undefined) stats[0] = Math.round(data.minimum / 12 / 1000) * 1000;
      if (data.median !== undefined) stats[1] = Math.round(data.median / 12 / 1000) * 1000;
      if (data.maximum !== undefined) stats[2] = Math.round(data.maximum / 12 / 1000) * 1000;
    });
    return stats;
  } catch (error) {
    throw error;
  }
}



export async function getIndustry(type : string){
  const stats: (number | null)[] = [null, null, null];

  try {
    const q = query(collection(db, 'industry'), where('type', '==', type));
    const result = await getDocs(q);

    if (result.empty) {
      return stats; 
    }

    result.forEach(doc => {
      const data = doc.data(); 
      if (data.minimum !== undefined) stats[0] = Math.round(data.minimum / 12 / 1000) * 1000;
      if (data.median !== undefined) stats[1] = Math.round(data.median / 12 / 1000) * 1000;
      if (data.maximum !== undefined) stats[2] = Math.round(data.maximum / 12 / 1000) * 1000;
    });
    return stats;
  } catch (error) {
    throw error;
  }
}


export async function getExpensesByCategory(transactions:any){
  let result:any = [9];
  for(let i=0; i<9; i++){
    result[i] = 0;
  }
  const currentMonth = new Date().getMonth();
  for(let i=0; i<transactions.length; i++){
    const dateString = transactions[i].date;
    const parts = dateString.split('/');
    const month = parseInt(parts[1], 10);
    if(month==currentMonth){
      if(transactions[i].category=='Groceries'){
        result[0] -= transactions[i].amount; 
      }
      else if(transactions[i].category=='Utilities'){
        result[1] -= transactions[i].amount; 
      }
      else if(transactions[i].category=='Entertainment'){
        result[2] -= transactions[i].amount; 
      }
      else if(transactions[i].category=='Transport'){
        result[3] -= transactions[i].amount; 
      }
      else if(transactions[i].category=='Insurance'){
        result[4] -= transactions[i].amount; 
      }
      else if(transactions[i].category=='Medical Aid'){
        result[5] -= transactions[i].amount; 
      }
      else if(transactions[i].category=='Eating Out'){
        result[6] -= transactions[i].amount; 
      }
      else if(transactions[i].category=='Shopping'){
        result[7] -= transactions[i].amount; 
      }
      else if(transactions[i].category=='Other'){
        result[8] -= transactions[i].amount; 
      }
    }
  }
  return result;
}

