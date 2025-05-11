import { initializeApp, getApp, FirebaseError } from 'firebase/app';
import { getFirestore, collection, addDoc, DocumentReference } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { initializeDevices } from './services/deviceService';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8IijO5nUlEwKkuKVmFOVRxLPlHviYvS0",
  authDomain: "homeos-84923.firebaseapp.com",
  projectId: "homeos-84923",
  storageBucket: "homeos-84923.appspot.com",
  messagingSenderId: "772818299440",
  appId: "1:772818299440:web:3c8f05eacac1cbf6c8dbf5"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (error instanceof FirebaseError && error.code === 'app/duplicate-app') {
    app = getApp();
  } else {
    throw error;
  }
}

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Initialize devices
initializeDevices().catch(console.error);

// Enable persistence for offline support
// enableIndexedDbPersistence(db).catch((err) => {
//   if (err.code === 'failed-precondition') {
//     console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
//   } else if (err.code === 'unimplemented') {
//     console.warn('The current browser does not support persistence.');
//   }
// });

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
} 

// Example usage
const deviceData = {
  name: "Living Room Light",
  type: "light",
  status: false,
  value: 0,
  lastUpdated: new Date()
};

// Add the device data to Firestore
addDoc(collection(db, 'devices'), deviceData)
  .then((docRef: DocumentReference) => {
    console.log('Device data added successfully! Document ID:', docRef.id);
  })
  .catch((error: Error) => {
    console.error('Error adding device data:', error);
  }); 