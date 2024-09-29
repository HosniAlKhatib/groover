import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database'; // Import database module

const firebaseConfig = {
  apiKey: 'AIzaSyDpPaaZcp4CYwRvORu_FdAAN0gKktT2G8c',
  authDomain: 'groover-cfp.firebaseapp.com',
  projectId: 'groover-cfp',
  storageBucket: 'groover-cfp.appspot.com',
  messagingSenderId: '23784461277',
  appId: '1:23784461277:web:d1ef647add091dfd749c34',
  measurementId: 'G-9NKEP4KD5B',
  databaseURL: 'https://groover-cfp-default-rtdb.firebaseio.com/',
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.database(); // Access the Realtime Database instance
const googleProvider = new firebase.auth.GoogleAuthProvider(); // Initialize Google Auth Provider
const gitHubProvider = new firebase.auth.GithubAuthProvider(); // Initialize GitHub Auth Provider (use correct casing)

export { auth, googleProvider, gitHubProvider, db };
export default app;
