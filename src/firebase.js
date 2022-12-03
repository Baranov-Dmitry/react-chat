// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMRHVHfUGzGATTE6T_e3ipFpvgIF__o6U",
  authDomain: "chat-f7a5c.firebaseapp.com",
  projectId: "chat-f7a5c",
  storageBucket: "chat-f7a5c.appspot.com",
  messagingSenderId: "153032481252",
  appId: "1:153032481252:web:e7fa51c6feb10331468ff1",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
