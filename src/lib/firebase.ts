
import { initializeApp, getApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getDatabase, type Database } from "firebase/database";

// Your web app's Firebase configuration
// These values should be in your .env file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);
let db: Database | null = null;

// The error happens when databaseURL is an invalid string (e.g., an empty string from .env).
// We check for a truthy value to prevent initialization with a bad URL.
if (firebaseConfig.databaseURL) {
    db = getDatabase(app);
} else {
    console.warn("Firebase Realtime Database URL is not provided in .env. Database features will be disabled.");
}

export { app, storage, db };
