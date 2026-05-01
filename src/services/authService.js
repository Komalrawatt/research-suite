// Authentication Service — handles all Firebase Auth operations
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { createUserModel } from "../models";

const googleProvider = new GoogleAuthProvider();

// Register a new user with email/password
export const registerUser = async (email, password, displayName, university = "", role = "Researcher") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Save user profile to Firestore
    const userModel = createUserModel({
      uid: user.uid,
      email: user.email,
      displayName,
      university,
      role,
    });

    try {
      await setDoc(doc(db, "users", user.uid), userModel);
    } catch (firestoreError) {
      // If Firestore save fails, delete the auth user to maintain consistency
      await user.delete();
      throw new Error(`Failed to save profile to database: ${firestoreError.message}`);
    }

    return { user, profile: userModel };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Sign in with email/password
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await getUserProfile(userCredential.user.uid);
  return { user: userCredential.user, profile };
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Check if user profile exists
  const profileRef = doc(db, "users", user.uid);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    const userModel = createUserModel({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
    });
    await setDoc(profileRef, userModel);
    return { user, profile: userModel };
  }

  return { user, profile: profileSnap.data() };
};

// Sign out
export const logoutUser = async () => {
  await signOut(auth);
};

// Get user profile from Firestore with retry logic
export const getUserProfile = async (uid) => {
  const profileRef = doc(db, "users", uid);
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const readPromise = getDoc(profileRef).then((snap) =>
        snap.exists() ? snap.data() : null
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Firestore read timed out.")),
          15000 // Increased from 10s to 15s for slower connections
        )
      );

      return await Promise.race([readPromise, timeoutPromise]);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.warn(`Firestore read attempt ${attempt}/${maxRetries} failed:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
  }

  throw new Error(
    `Failed to fetch profile after ${maxRetries} attempts. ${lastError?.message || 'Unknown error'}. ` +
    `Ensure Firestore database exists at: https://console.firebase.google.com/project/${import.meta.env.VITE_FIREBASE_PROJECT_ID}`
  );
};

// Update user profile in Firestore with retry logic
export const updateUserProfile = async (uid, updates) => {
  if (!uid) throw new Error("User ID is required to update profile.");
  const profileRef = doc(db, "users", uid);
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Wrap setDoc in a timeout so it doesn't hang if Firestore is unreachable
      const writePromise = setDoc(
        profileRef,
        { ...updates, updatedAt: new Date().toISOString() },
        { merge: true }
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Firestore write timed out.")),
          15000 // Increased from 10s to 15s
        )
      );

      return await Promise.race([writePromise, timeoutPromise]);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.warn(`Firestore write attempt ${attempt}/${maxRetries} failed:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
  }

  throw new Error(
    `Failed to update profile after ${maxRetries} attempts. ${lastError?.message || 'Unknown error'}. ` +
    `Ensure Firestore database exists at: https://console.firebase.google.com/project/${import.meta.env.VITE_FIREBASE_PROJECT_ID}`
  );
};

// Update Firebase Auth profile
export const updateAuthName = async (displayName) => {
  if (!auth.currentUser) return;
  await updateProfile(auth.currentUser, { displayName });
  return auth.currentUser;
};

// Auth state observer
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
