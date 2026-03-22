import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkKd69mse7G1eT1oxQrmIexF-ck4z6HkI",
  authDomain: "anestlog-de84b.firebaseapp.com",
  projectId: "anestlog-de84b",
  storageBucket: "anestlog-de84b.firebasestorage.app",
  messagingSenderId: "450674204664",
  appId: "1:450674204664:web:8857e69082c0c4b091000d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
