import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCitURtScrL3bRsBHCXuXbB7eBtQ3J82dI",
  authDomain: "playerpropapp.firebaseapp.com",
  projectId: "playerpropapp",
  storageBucket: "playerpropapp.appspot.com",
  messagingSenderId: "147451750774",
  appId: "1:147451750774:web:056c8c98a6ca7d0b70b257",
  measurementId: "G-0S5FVYK7RM"
};
//Export application and DB
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);