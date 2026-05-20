import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isDemo } from '../firebaseConfig';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile details from Firestore (Production Mode) or LocalStorage (Demo Mode)
  const syncUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (isDemo) {
      // Local Mock DB Sync
      const localUsers = JSON.parse(localStorage.getItem('soulsync_mock_users') || '{}');
      let profile = localUsers[firebaseUser.uid];
      if (!profile) {
        // Create initial profile
        profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Friend',
          streakDays: 0,
          xp: 0,
          badges: [],
          safetyCircle: [],
          enableAutoAlerts: false,
          lastCheckInDate: null
        };
        localUsers[firebaseUser.uid] = profile;
        localStorage.setItem('soulsync_mock_users', JSON.stringify(localUsers));
      }
      setUser(profile);
      setLoading(false);
    } else {
      // Production Firebase Sync
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() });
        } else {
          // Initialize user document in Firestore
          const initialData = {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Friend',
            streakDays: 0,
            xp: 0,
            badges: [],
            safetyCircle: [],
            enableAutoAlerts: false,
            lastCheckInDate: null
          };
          await setDoc(userDocRef, initialData);
          setUser({ uid: firebaseUser.uid, ...initialData });
        }
      } catch (error) {
        console.error("Error syncing user profile from Firestore:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Firebase auth state listener
  useEffect(() => {
    if (!isDemo) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          syncUserProfile(firebaseUser);
        } else {
          setUser(null);
          setLoading(false);
        }
      });
      return unsubscribe;
    } else {
      // Demo Mode Session Restore
      const sessionUserUid = localStorage.getItem('soulsync_demo_session');
      if (sessionUserUid) {
        syncUserProfile({ uid: sessionUserUid });
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Update user profile function (runs on changes in settings, moods, streaks)
  const updateProfile = async (updatedFields) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);

    if (isDemo) {
      const localUsers = JSON.parse(localStorage.getItem('soulsync_mock_users') || '{}');
      localUsers[user.uid] = updatedUser;
      localStorage.setItem('soulsync_mock_users', JSON.stringify(localUsers));
    } else {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, updatedFields);
      } catch (error) {
        console.error("Error updating user document in Firestore:", error);
      }
    }
  };

  // Signup
  const signup = async (email, password, name) => {
    setLoading(true);
    if (isDemo) {
      // Simulated signup
      const uid = 'demo_' + Math.random().toString(36).substr(2, 9);
      const localUsers = JSON.parse(localStorage.getItem('soulsync_mock_users') || '{}');
      const newProfile = {
        uid,
        email,
        displayName: name,
        streakDays: 0,
        xp: 0,
        badges: [],
        safetyCircle: [],
        enableAutoAlerts: false,
        lastCheckInDate: null
      };
      localUsers[uid] = newProfile;
      localStorage.setItem('soulsync_mock_users', JSON.stringify(localUsers));
      localStorage.setItem('soulsync_demo_session', uid);
      setUser(newProfile);
      setLoading(false);
      return newProfile;
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Initialize profile
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const initialData = {
        email,
        displayName: name,
        streakDays: 0,
        xp: 0,
        badges: [],
        safetyCircle: [],
        enableAutoAlerts: false,
        lastCheckInDate: null
      };
      await setDoc(userDocRef, initialData);
      setUser({ uid: userCredential.user.uid, ...initialData });
      setLoading(false);
      return userCredential.user;
    }
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    if (isDemo) {
      // Simulated login
      const localUsers = JSON.parse(localStorage.getItem('soulsync_mock_users') || '{}');
      const matchedUser = Object.values(localUsers).find(u => u.email === email);
      if (matchedUser) {
        localStorage.setItem('soulsync_demo_session', matchedUser.uid);
        setUser(matchedUser);
        setLoading(false);
        return matchedUser;
      } else {
        setLoading(false);
        throw new Error("Invalid credentials or user does not exist in Demo Mode.");
      }
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return userCredential.user;
    }
  };

  // Google Login / Signup
  const loginWithGoogle = async () => {
    setLoading(true);
    if (isDemo) {
      // Simulate Google Sign-In
      const uid = 'demo_google_' + Math.random().toString(36).substr(2, 9);
      const email = 'google_user@example.com';
      const name = 'Google Friend';
      const localUsers = JSON.parse(localStorage.getItem('soulsync_mock_users') || '{}');
      
      let existingProfile = Object.values(localUsers).find(u => u.email === email);
      if (!existingProfile) {
        existingProfile = {
          uid,
          email,
          displayName: name,
          streakDays: 0,
          xp: 0,
          badges: [],
          safetyCircle: [],
          enableAutoAlerts: false,
          lastCheckInDate: null
        };
        localUsers[uid] = existingProfile;
        localStorage.setItem('soulsync_mock_users', JSON.stringify(localUsers));
      }
      
      localStorage.setItem('soulsync_demo_session', existingProfile.uid);
      setUser(existingProfile);
      setLoading(false);
      return existingProfile;
    } else {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setLoading(false);
      return userCredential.user;
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    if (isDemo) {
      localStorage.removeItem('soulsync_demo_session');
      setUser(null);
      setLoading(false);
    } else {
      await signOut(auth);
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    isDemoMode: isDemo
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
