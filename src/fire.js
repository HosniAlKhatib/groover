import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCz8fk1UR_b05eF_7AxESy0kJKwz0zv7ts',
  authDomain: 'groover-hmh.firebaseapp.com',
  projectId: 'groover-hmh',
  storageBucket: 'groover-hmh.firebasestorage.app',
  messagingSenderId: '202885201348',
  appId: '1:202885201348:web:87634cff9862e995ed7891',
  measurementId: 'G-JMHQEKKS2T',
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.database();
export const storage = firebase.storage();

export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const githubProvider = new firebase.auth.GithubAuthProvider();

export default firebase;
