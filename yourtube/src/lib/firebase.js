// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOtHJcyceyUx8NHXudKfjcWlUCwGbwKyQ",
  authDomain: "clonem2.firebaseapp.com",
  projectId: "clonem2",
  storageBucket: "clonem2.firebasestorage.app",
  messagingSenderId: "632421976615",
  appId: "1:632421976615:web:6e94e6ad1e27f1f0885c02",
  measurementId: "G-EXT38RVFH2"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
