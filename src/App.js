import React, { useEffect, useState } from "react";

import {
  AppBar,
  Button,
  Grid,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Route, Routes, useNavigate } from "react-router-dom";
// import { Signup } from "./auth/Signup";
// import { Login } from "./auth/Login";
import PhoneScheduler from "./PhoneScheduler";
import Auth from "./auth/Auth";
// import { PrivateRoute } from "./components/PrivateRoute";
import DefaultPage from "./components/DefaultPage";
import { supabase } from "./database/client";
import Account from "./auth/Account";
import { Box } from "@mui/system";

function App() {
  const navigate = useNavigate();

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

  const logOut = () => {
    supabase.auth.signOut();
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              SAF Turni telefono
            </Typography>
            {!session ? null : (
              <Button color="inherit" onClick={logOut}>
                Log out
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <div className="wrapper" style={{ margin: "40px 20px" }}>
        <div className="container mx-auto">
          {!session ? <Auth /> : <PhoneScheduler />}
        </div>
        {/* <AuthProvider> */}
        {/* <Routes> */}
        {/* <Route
            path="/"
            element={
              <PrivateRoute>
                <PhoneScheduler />
              </PrivateRoute>
            }
          /> */}

        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* <Route path="/" element={<PhoneScheduler />} /> */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/*" element={<DefaultPage />} /> */}
        {/* </Routes> */}
        {/* </AuthProvider> */}
      </div>
    </div>
  );
}

export default App;
