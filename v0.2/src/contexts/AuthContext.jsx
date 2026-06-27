import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUserProfile } from "@/hooks/useUserProfile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setFirebaseUser(u ?? null));
  }, []);

  const { profile, loading: profileLoading, error } = useUserProfile(
    firebaseUser || null
  );

  const loading = firebaseUser === undefined || (firebaseUser && profileLoading);

  return (
    <AuthContext.Provider
      value={{
        user: firebaseUser,
        role: profile?.role ?? null,
        profile,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
