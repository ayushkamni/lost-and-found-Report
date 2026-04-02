import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // Firestore data including role
  const [loading, setLoading] = useState(true);

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create new user profile
        const newUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user', // default role
          status: 'active',
          createdAt: new Date()
        };
        await setDoc(userRef, newUserData);
        setUserData(newUserData);
      } else {
        setUserData(userSnap.data());
      }
      return user;
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      throw error;
    }
  };

  // Sign up with Email/Password
  const signupWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update Auth Profile
      await updateProfile(user, { displayName, photoURL: 'https://via.placeholder.com/150' });

      // Save to Firestore
      const newUserData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: 'https://via.placeholder.com/150',
        role: 'user', 
        status: 'active',
        createdAt: new Date()
      };
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, newUserData);
      setUserData(newUserData);
      
      return user;
    } catch (error) {
      console.error("Email Signup Error:", error);
      throw error;
    }
  };

  // Login with Email/Password
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // user data loading is handled by onAuthStateChanged listener
      return result.user;
    } catch (error) {
      console.error("Email Login Error:", error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      try {
        if (user) {
          // Fetch user role/data from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback user data if Firestore fails due to rules
        setUserData({ role: 'user' }); 
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loginWithGoogle,
    signupWithEmail,
    loginWithEmail,
    logout,
    isAdmin: userData?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
