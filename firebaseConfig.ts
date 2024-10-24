// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGaDBHgcVrLYD_4Ls9S6LniZG7mE1WXKQ",
  authDomain: "automated-paper-evaluati-3fcea.firebaseapp.com",
  projectId: "automated-paper-evaluati-3fcea",
  storageBucket: "automated-paper-evaluati-3fcea.appspot.com",
  messagingSenderId: "184959471092",
  appId: "1:184959471092:web:4c99a4544bd03ca5e77da1",
  measurementId: "G-6JTDDGGQTT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
