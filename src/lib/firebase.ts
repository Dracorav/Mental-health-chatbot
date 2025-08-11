// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "careme-xio3c",
  appId: "1:641786164037:web:7750c394b5b11fb629442c",
  storageBucket: "careme-xio3c.firebasestorage.app",
  apiKey: "AIzaSyD6IDebyPBb4l0oE8MAf_4fd14B2jwitb8",
  authDomain: "careme-xio3c.firebaseapp.com",
  messagingSenderId: "641786164037"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
