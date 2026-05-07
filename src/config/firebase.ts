import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD7taOi8pUBLjd-BlE-n4SKkC0zFPCWKoU",
  authDomain: "ironfit-b935f.firebaseapp.com",
  projectId: "ironfit-b935f",
  storageBucket: "ironfit-b935f.firebasestorage.app",
  messagingSenderId: "472444619529",
  appId: "1:472444619529:web:faf807b177253f20f3a1d8",
  measurementId: "G-95L0WXLXWG"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const analytics = isSupported().then(supported => {
  if (supported) {
    return getAnalytics(app);
  }
  return null;
});

if (app) {
  console.log("Firebase initialized successfully for Project:", firebaseConfig.projectId);
}

export const db = getFirestore(app);

// Auth initialization
let firebaseAuth;
try {
  firebaseAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  // If already initialized, use getAuth
  firebaseAuth = getAuth(app);
}

export const auth = firebaseAuth;
