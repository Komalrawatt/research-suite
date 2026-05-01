// Auth Context — provides authentication state throughout the app
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthChange, getUserProfile, logoutUser, updateUserProfile, updateAuthName } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!isMounted) return;
      
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          if (isMounted) {
            setProfile(userProfile);
            setAuthError(null);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          if (isMounted) {
            setAuthError(err.message);
            // If it's a first-time user with no profile, that's OK
            if (err.message.includes("timed out")) {
              console.warn("Profile fetch timed out - user may not have a profile yet");
            }
          }
        }
      } else {
        setUser(null);
        setProfile(null);
        setAuthError(null);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async (uidOverride) => {
    const targetId = uidOverride || user?.uid;
    if (!targetId) return null;

    try {
      const userProfile = await getUserProfile(targetId);
      setProfile(userProfile);
      return userProfile;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  };

  const updateProfileData = async (updates) => {
    if (!user) throw new Error("You must be logged in to update your profile.");

    // 1. Write to Firestore
    await updateUserProfile(user.uid, updates);

    // 2. Update Auth Display Name if provided
    if (updates.displayName) {
      try {
        const updatedUser = await updateAuthName(updates.displayName);
        if (updatedUser) setUser({ ...updatedUser });
      } catch (authError) {
        console.warn("Auth display name update failed (non-critical):", authError);
      }
    }

    // 3. Refresh the local profile state from Firestore
    try {
      const newProfile = await refreshProfile(user.uid);
      return { success: true, profile: newProfile };
    } catch (refreshError) {
      // The write succeeded, but re-read failed — update local state manually
      console.warn("Profile refresh after save failed:", refreshError);
      setProfile((prev) => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
      return { success: true, profile: { ...profile, ...updates } };
    }
  };

  const value = {
    user,
    profile,
    loading,
    authError,
    logout,
    refreshProfile,
    updateProfileData,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
