import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "./security/SecureFirebase.js";
import { auth, googleProvider, db } from './firebase';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
};

export const createAccount = async (email, password, userData) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user, userData);
    return result.user;
  } catch (error) {
    console.error("Account creation error:", error);
    throw error;
  }
};

const createUserProfile = async (user, additionalData = {}) => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName || additionalData.name,
      email: user.email,
      role: additionalData.role || "customer",
      apps: [import.meta.env.VITE_APP_NAME],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

export const signOutUser = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
