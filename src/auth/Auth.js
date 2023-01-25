import React, { useContext, useState, useEffect } from "react";
import { supabase } from "../database/client";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const session = supabase.auth.getSession();

    setUser(session?.user ?? {});
    setLoading(false);

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? {});
        setLoading(false);
      }
    );

    return () => {
      listener?.unsubscribe();
    };
  }, []);

  // Will be passed down to Signup, Login and Dashboard components
  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    validateUser: (jwt) => supabase.auth.getUser(jwt),
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
