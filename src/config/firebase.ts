import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD7taOi8pUBLjd-BlE-n4SKkC0zFPCWKoU",
  authDomain: "ironfit-b935f.firebaseapp.com",
  projectId: "ironfit-b935f",
  storageBucket: "ironfit-b935f.firebasestorage.app",
  messagingSenderId: "472444619529",
  appId: "1:472444619529:web:faf807b177253f20f3a1d8",
  measurementId: "G-95L0WXLXWG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


if (app) {
  console.log("Firebase initialized successfully for Project:", firebaseConfig.projectId);
} else {
  console.error("Firebase initialization failed.");
}

export const db = getFirestore(app);
export const auth = getAuth(app);
