import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0MgSMp-hXabyKZGK3GVC7XyoIkf9t208",
  authDomain: "ecoecho-2dabe.firebaseapp.com",
  projectId: "ecoecho-2dabe",
  storageBucket: "ecoecho-2dabe.firebasestorage.app",
  messagingSenderId: "470526846789",
  appId: "1:470526846789:web:700cbb6e08f9b79e9cc02c",
  measurementId: "G-NS9C1RFBRC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
