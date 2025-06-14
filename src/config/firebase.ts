// src/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8IijO5nUlEwKkuKVmFOVRxLPlHviYvS0",
  authDomain: "homeos-84923.firebaseapp.com",
  projectId: "homeos-84923",
  storageBucket: "homeos-84923.firebasestorage.app",
  messagingSenderId: "772818299440",
  appId: "1:772818299440:web:3c8f05eacac1cbf6c8dbf5",
  measurementId: "G-VCJ8WHVWVL"
};

// Prevent duplicate Firebase app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
