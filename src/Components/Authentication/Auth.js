import React, { useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider, db } from '../../fire';
import app from '../../fire';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState();
  const storage = app.storage();
  const users = db.ref('users');
  const storageRef = storage.ref();

  const validateSignUpData = (data, password) => {
    if (data.name.length < 3 || data.name.length > 25) {
      alert('Name must be between 3 and 25 characters.');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(data.email)) {
      alert('Invalid email address.');
      return false;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()~`{}\]:;"'<>,.?\\|-]).{10,}$/;
    const embeddedPattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()~`{}\]:;"'<>,.?\\|-])/;

    if (
      !passwordPattern.test(password) ||
      !embeddedPattern.test(password.slice(1, -1))
    ) {
      alert(
        'Password must be at least 10 characters long, contain at least one lowercase letter, one uppercase letter, one numeric character, and one special character, with the special character, uppercase letter, and numeric character embedded in the middle.'
      );
      return false;
    }
    return true;
  };
  async function checkUser(email) {
    try {
      const usersRef = db.ref('users');
      const snapshot = await usersRef
        .orderByChild('email')
        .equalTo(email)
        .once('value');
      if (snapshot.exists()) {
        const users = snapshot.val();
        const userId = Object.keys(users)[0];
        return { userId, ...users[userId] };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error checking database for user by email: ', error);
      return null;
    }
  }
  async function createUser(user) {
    const userData = {
      email: user.email,
      name: user.displayName,
      profilePicture: user.photoURL,
      provider: user.providerData[0].providerId,
      userId: user.uid,
    };

    try {
      await db.ref('users/' + user.uid).set(userData);
      console.log('User created successfully:', userData);
      return userData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  async function handleProviderSignIn(provider) {
    const isOnSignUpPage = window.location.pathname === '/signup';

    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      await new Promise((resolve) => setTimeout(resolve, 500));

      const existingUser = await checkUser(user.email);
      if (isOnSignUpPage && existingUser) {
        alert('You already have an account. Please log in instead.');
        window.location.replace('/login');
        return;
      } else if (existingUser && !isOnSignUpPage) {
        const existingProvider = existingUser.provider;
        if (existingProvider !== provider.providerId) {
          alert(
            `This email is associated with a ${existingProvider} account. Please sign in with ${existingProvider}.`
          );
          await user.delete();
          return false;
        } else {
          const updatedData = {
            name: user.displayName || existingUser.name,
            profilePicture: user.photoURL || existingUser.profilePicture,
          };
          await db.ref('users/' + existingUser.userId).update(updatedData);
          console.log(
            'Welcome back! Your profile has been updated:',
            updatedData
          );
        }
      } else if (!existingUser && !isOnSignUpPage) {
        alert(
          "You don't have an account. Please create a new account in the sign up page."
        );
        await user.delete();
        window.location.replace('/signup');
        return;
      } else if (!existingUser && isOnSignUpPage) {
        await createUser(user);
      }
      window.location.replace('/');
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        alert('Too many attempts. Please try again later.');
      } else {
        alert('An error occurred: ' + err.message);
      }
    }
  }

  async function authenticateUser(
    email,
    password,
    isNewUser = false,
    displayName = null
  ) {
    try {
      let res;
      if (isNewUser) {
        res = await auth.createUserWithEmailAndPassword(email, password);

        const userData = {
          name: displayName || res.user.displayName,
          email: res.user.email,
          provider: 'password',
        };
        await db.ref('users/' + res.user.uid).set(userData);
      } else {
        res = await auth.signInWithEmailAndPassword(email, password);
      }
      return res;
    } catch (error) {
      console.error('Error during authentication: ', error.message);
      throw error;
    }
  }

  async function signUp(data, password) {
    if (validateSignUpData(data, password)) {
      try {
        const existingUser = await checkUser(data.email);

        if (existingUser) {
          alert(
            `You already have an account with ${existingUser.provider}. Please log in instead.`
          );
          window.location.replace('/login');
          return;
        }

        await authenticateUser(data.email, password, true, data.name);
        window.location.replace('/');
      } catch (err) {
        alert('An error occurred: ' + err.message);
      }
    }
  }

  const Google = async () => {
    try {
      await handleProviderSignIn(googleProvider);
    } catch (error) {
      alert('Error during Google Sign-in: ' + error.message);
    }
  };

  const GitHub = async () => {
    try {
      await handleProviderSignIn(githubProvider);
    } catch (error) {
      alert('Error during GitHub Sign-in: ' + error.message);
    }
  };

  function login(email, password) {
    return authenticateUser(email, password);
  }
  function logOut() {
    return auth.signOut();
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const snapshot = await db.ref(`users/${user.uid}`).once('value');
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setName(userData.name);
            setEmail(userData.email);
            setImage(userData.profilePicture || user.photoURL || null);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signUp,
    Google,
    GitHub,
    logOut,
    name,
    email,
    image: image || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
