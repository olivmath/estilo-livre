import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUserProfile } from "@/hooks/useUserProfile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u ?? null);
    });
  }, []);

  const { profile, loading: profileLoading, error } = useUserProfile(
    firebaseUser || null
  );

  useEffect(() => {
    if (error) {
      setAuthError(error);
      signOut(auth);
    }
  }, [error]);

  useEffect(() => {
    if (firebaseUser && profile?.role) {
      firebaseUser.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.role !== profile.role) {
          console.log("Custom claims out of sync. Force refreshing token...");
          firebaseUser.getIdToken(true).then(() => {
            console.log("Token successfully refreshed with new claims.");
          });
        }
      });
    }
  }, [firebaseUser, profile]);

  const loading = firebaseUser === undefined || (firebaseUser && profileLoading);

  return (
    <AuthContext.Provider
      value={{
        user: firebaseUser,
        role: profile?.role ?? null,
        profile,
        loading,
        error,
        authError,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
