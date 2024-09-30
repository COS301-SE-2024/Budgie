import { getAuth } from 'firebase/auth';
import { db } from '../../../../../apps/budgie-app/firebase/clientApp';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query, 
  where,
  setDoc,
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
  const a = query(
    collection(db, `accounts`), 
    where('uid', '==', uid), 
    where('type', '==', 'current')
  );
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
  let currentMonth = new Date().getMonth();

  while(balance==0){
    for(let i=0; i<transactions.length; i++){
      const dateString = transactions[i].date;
      const parts = dateString.split('/');
      const month = parseInt(parts[1], 10);
      if(month==currentMonth && transactions[i].amount>0){
        balance += transactions[i].amount;
      }
    }
    currentMonth -= 1;
  }
  return balance;
}

export async function getPosition(position : string){
  const stats: (number)[] = [-1, -1, -1];

  try {
    const q = query(
      collection(db, 'job_positions'), 
      where('type', '==', position)
    );
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
  const stats: (number)[] = [-1, -1, -1];

  try {
    const q = query(
      collection(db, 'industry'), 
      where('type', '==', type)
    );
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
  let result:any = Array(9).fill(0);
  let all = 0;

  let currentMonth = new Date().getMonth();

  while(all==0){
    for(let i=0; i<transactions.length; i++){
      const dateString = transactions[i].date;
      const parts = dateString.split('/');
      const month = parseInt(parts[1], 10);
      if(month==currentMonth){
        if(transactions[i].category=='Groceries'){
          result[0] -= transactions[i].amount; 
          all -= transactions[i].amount;
        }
        else if(transactions[i].category=='Utilities'){
          result[1] -= transactions[i].amount; 
          all -= transactions[i].amount;
        }
        else if(transactions[i].category=='Entertainment'){
          result[2] -= transactions[i].amount; 
          all -= transactions[i].amount;
        }
        else if(transactions[i].category=='Transport'){
          result[3] -= transactions[i].amount; 
          all -= transactions[i].amount;
        }
        else if(transactions[i].category=='Insurance'){
          result[4] -= transactions[i].amount; 
          all -= transactions[i].amount;
        }
        else if(transactions[i].category=='Medical Aid'){
          result[5] -= transactions[i].amount; 
          all -= transactions[i].amount;
        }
        else if(transactions[i].category=='Eating Out'){
          result[6] -= transactions[i].amount; 
          all -= transactions[i].amount;
        }
        else if(transactions[i].category=='Shopping'){
          result[7] -= transactions[i].amount; 
          all -= transactions[i].amount;
        }
        else if(transactions[i].category=='Other'){
          result[8] -= transactions[i].amount; 
          all -= transactions[i].amount;
        }
      }
    }
    currentMonth -= 1;
  }
  return result;
}


export async function addUserInfo(userData : any){
  let uid = getUser();

  if(uid){
    try {
      await setDoc(doc(db, 'user_info', uid), userData);
      console.log('User info successfully saved to Firestore');
    } catch (error) {
        console.error('Error saving user info to Firestore:', error);
    }
  }
}


export async function getUserInfo(){
  let user = getUser();

  if (user) {
    try {
      const userInfoQuery = query(
        collection(db, 'user_info'),
        where('uid', '==', user)
      );

      const querySnapshot = await getDocs(userInfoQuery);

      let userInfo: any = null;
      querySnapshot.forEach((doc) => {
        userInfo = doc.data();
      });
      return userInfo;

    } catch (error) {
      alert(error);
    }
  } else {
    alert('User is not authenticated');
  }
}

export async function getIncomeByAge(age : number){
  let amount = 0;

  try {
    const q = query(
      collection(db, 'income_by_age'), 
      where('from', '<=', age), 
      where('to', '>=', age));
    const result = await getDocs(q);

    if (result.empty) {
      return amount; 
    }

    result.forEach(doc => {
      const data = doc.data(); 
      amount = Math.round(data.average / 12 / 100) * 100;
    });
    return amount;

  } catch (error) {
    throw error;
  }
}



export async function getSpendingByCategory(){
  const category: number[] = Array(9).fill(0);
  try {
    const q = query(
      collection(db, 'spending_by_category'), 
    );
    const result = await getDocs(q);

    if (result.empty) {
      return category; 
    }

    result.forEach(doc => {
      const data = doc.data(); 
      category[0] = data.Groceries;
      category[1] = data.Utilities;
      category[2] = data.Entertainment;
      category[3] = data.Transport;
      category[4] = data.Insurance;
      category[5] = data.MedicalAid;
      category[6] = data.EatingOut;
      category[7] = data.Shopping;
      category[8] = data.Other;
    });
    return category;

  } catch (error) {
    throw error;
  }
}

