import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ract-31120.firebaseapp.com",
  projectId: "ract-31120",
  storageBucket: "ract-31120.firebasestorage.app",
  messagingSenderId: "164124157182",
  appId: "1:164124157182:web:f008438b66da3233fa31af"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
