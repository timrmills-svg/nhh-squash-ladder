import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDHDzy1hxQK8KQeQ7QmckQCaWY_-CdB8S4",
  authDomain: "nhh-squash-ladder.firebaseapp.com",
  projectId: "nhh-squash-ladder",
  storageBucket: "nhh-squash-ladder.firebasestorage.app",
  messagingSenderId: "797960626398",
  appId: "1:797960626398:web:149681d79d47f3446be24f",
  measurementId: "G-RY8MS8MHYV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
