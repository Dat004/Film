// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_FIRE_BASE_API_KEY,
  authDomain: "film-project-7b1c8.firebaseapp.com",
  projectId: "film-project-7b1c8",
  storageBucket: "film-project-7b1c8.appspot.com",
  messagingSenderId: "185343802866",
  appId: "1:185343802866:web:d2171973d7cb70a0c1ff6b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
