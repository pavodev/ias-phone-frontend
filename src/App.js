import React, { useState } from "react";

import { Button, Typography } from "@mui/material";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Signup } from "./auth/Signup";
import { Login } from "./auth/Login";
import PhoneScheduler from "./PhoneScheduler";
import { AuthProvider, useAuth } from "./auth/Auth";
import { PrivateRoute } from "./components/PrivateRoute";
import DefaultPage from "./components/DefaultPage";

function App() {
  const navigate = useNavigate();

  return (
    <div className="wrapper" style={{ margin: "20px" }}>
      <Typography
        variant="h2"
        fontWeight={700}
        my={4}
        component="h1"
        gutterBottom
      >
        IAS Turni telefono
      </Typography>
      <AuthProvider>
        <Routes>
          {/* <Route
            path="/"
            element={
              <PrivateRoute>
                <PhoneScheduler />
              </PrivateRoute>
            }
          /> */}

          {/* <Route path="/signup" element={<Signup />} /> */}
          <Route path="/" element={<PhoneScheduler />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/*" element={<DefaultPage />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
