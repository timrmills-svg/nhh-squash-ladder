import { useState, useEffect, useMemo } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const useFirebaseAuth = () => {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stabilize currentUser object reference using useMemo
  const currentUser = useMemo(() => {
    if (!authData) return null;
    return {
      uid: authData.uid,
      email: authData.email,
      displayName: authData.displayName,
      ...authData.additionalData
    };
  }, [authData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const additionalData = userDoc.exists() ? userDoc.data() : {};
        
        console.log("=== SETTING AUTH DATA ===", user.email);
        setAuthData({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email,
          additionalData
        });
      } else {
        setAuthData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("=== FIREBASE AUTH SUCCESS ===", result.user.email);
      return result;
    } catch (error) {
      console.log("=== FIREBASE AUTH FAILED ===", error.code, error.message);
      throw error;
    }
  };

  const logout = async () => {
    return await signOut(auth);
  };

  return {
    currentUser,
    loading,
    login,
    logout
  };
};
