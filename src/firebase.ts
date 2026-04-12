import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBJfB8tAXqPltSQ0QeIaD8SiR6UhWHnfbE",
  authDomain: "adbreak-companion-40eaa.firebaseapp.com",
  projectId: "adbreak-companion-40eaa",
  storageBucket: "adbreak-companion-40eaa.firebasestorage.app",
  messagingSenderId: "652767115735",
  appId: "1:652767115735:web:bc874f45bd0fcdb8573392",
  databaseURL: "https://adbreak-companion-40eaa-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();