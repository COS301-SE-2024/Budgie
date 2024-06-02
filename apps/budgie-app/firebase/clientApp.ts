import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCjt6UnO1y9MAy1pcZJZzud-cbLak8zxSM",
  authDomain: "budgieapp-70251.firebaseapp.com",
  databaseURL: "https://budgieapp-70251-default-rtdb.firebaseio.com",
  projectId: "budgieapp-70251",
  storageBucket: "budgieapp-70251.appspot.com",
  messagingSenderId: "844132380486",
  appId: "1:844132380486:web:c8b0d1ef92593145923f47",
  measurementId: "G-E7WEEV82H5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// connectFirestoreEmulator(db, '127.0.0.1', 8080);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
