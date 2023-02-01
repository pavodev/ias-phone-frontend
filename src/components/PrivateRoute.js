import React, { useEffect, useState } from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import Auth from "../auth/Auth";
import { supabase } from "../database/client";

export function PrivateRoute({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      let { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      console.log("CURRENT SESSION: ", data, error);
    };
    // setSession(supabase.auth.getSession());
    fetchSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return <Auth />;
  }
  // authorized so return child components
  return children;
}
