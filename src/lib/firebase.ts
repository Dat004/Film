import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { env } from "./env";

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "film-project-7b1c8.firebaseapp.com",
  projectId: "film-project-7b1c8",
  storageBucket: "film-project-7b1c8.appspot.com",
  messagingSenderId: "185343802866",
  appId: "1:185343802866:web:d2171973d7cb70a0c1ff6b",
  databaseURL: "https://film-project-7b1c8-default-rtdb.firebaseio.com",
};

// Initialize Firebase (singleton pattern for SSR compatibility)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, database, storage, googleProvider };
