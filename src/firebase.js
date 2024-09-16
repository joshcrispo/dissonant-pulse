// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvdPREJWPGUwHKIKlepht505Z0l6NuVF8",
  authDomain: "dissonant-pulse-db.firebaseapp.com",
  projectId: "dissonant-pulse-db",
  storageBucket: "dissonant-pulse-db.appspot.com",
  messagingSenderId: "604809379598",
  appId: "1:604809379598:web:bdf8c6e57584660267a15f",
  measurementId: "G-G6K3CZ3W62"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

export const storage = getStorage();