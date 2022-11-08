// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore'
import { getAuth, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { SessionManager } from './sessionManager';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

/**
 * The apiKey in this configuration snippet just identifies your
 * Firebase project on the Google servers. It is not a security risk 
 * for someone to know it. In fact, it is necessary for them to know 
 * it, in order for them to interact with your Firebase project. This 
 * same configuration data is also included in every iOS and Android 
 * app that uses Firebase as its backend.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDDfB92e-rvY08msCFedG-t9p1tP8mjW70",
  authDomain: "citrus-react.firebaseapp.com",
  projectId: "citrus-react",
  storageBucket: "citrus-react.appspot.com",
  messagingSenderId: "735310504995",
  appId: "1:735310504995:web:5093441ef61a7b5f6b3d96",
  measurementId: "G-F269165D6E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const firestore = getFirestore();

/**
 * Sign out user and remove localStorage item
 */
export async function signOutUser() {
  return new Promise((resolve, reject) => {
      signOut(auth).then((result) => {
          SessionManager.clearLS();
          resolve(null);
      }).catch((error) => {
          reject(error);
      });
  })
}

/**
 * Sign in user with google and return user
 */
const provider = new GoogleAuthProvider();
export async function signInWithGoogle() {
    return new Promise((resolve, reject) => {
        signInWithPopup(auth, provider).then((result) => {
          resolve(result.user);
        }).catch((error) => {
          reject(error);
        });
    })
}