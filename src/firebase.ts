import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8IijO5nUlEwKkuKVmFOVRxLPlHviYvS0",
  authDomain: "homeos-84923.firebaseapp.com",
  projectId: "homeos-84923",
  storageBucket: "homeos-84923.firebasestorage.app",
  messagingSenderId: "772818299440",
  appId: "1:772818299440:web:3c8f05eacac1cbf6c8dbf5",
  measurementId: "G-VCJ8WHVWVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app); 