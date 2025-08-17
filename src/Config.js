// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firebase Auth and Firestore
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA0MgSMp-hXabyKZGK3GVC7XyoIkf9t208",
  authDomain: "ecoecho-2dabe.firebaseapp.com",
  projectId: "ecoecho-2dabe",
  storageBucket: "ecoecho-2dabe.firebasestorage.app",
  messagingSenderId: "470526846789",
  appId: "1:470526846789:web:700cbb6e08f9b79e9cc02c",
  measurementId: "G-NS9C1RFBRC"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// 🔐 HANDLE GOOGLE LOGIN
const handleGoogleLogin = async (setError, navigate, setUser) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google Sign-In:", result.user);
    setUser(result.user);
    localStorage.setItem("user", JSON.stringify(result.user));
    setError('');

    // Firestore user document logic
    const userId = result.user.uid;
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        userId: userId,
        email: result.user.email,
        googleName: result.user.displayName,
        nickname: result.user.displayName,
        profilePicture: result.user.photoURL,
        language: "en",
        isVerified: false,
        reportsSubmitted: 0,
        peopleHelped: 0
      });
    }

    navigate("/dashboard");
    return true;
  } catch (err) {
    console.log(err);
    setError("Google Sign-In failed");
    return false;
  }
};

// 🔐 HANDLE LOGIN USING EMAIL + PASSWORD
const handleSubmit = async (e, setError) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in:", userCred.user);
    setError('');
  } catch (err) {
    console.log(err);
    setError("Invalid email or password");
  }

  e.target.reset();
};

export { auth, db, googleProvider, handleGoogleLogin, handleSubmit, onAuthStateChanged };
