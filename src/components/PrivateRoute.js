import React from "react";
import { Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/Auth";

export function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // not logged in so redirect to login page with the return url
    return <Navigate to="/login" state={{ from: history.location }} />;
  }

  // authorized so return child components
  return children;
}
