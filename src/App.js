import React, { useEffect, useState } from "react";
import "./App.css";

import {
  AppBar,
  Button,
  Divider,
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
import { PrivateRoute } from "./components/PrivateRoute";
import DefaultPage from "./components/DefaultPage";
import { supabase } from "./database/client";
import Account from "./auth/Account";
import { Box } from "@mui/system";
import SetPassword from "./auth/SetPassword";

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

  const logOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
              <>
                <Button color="inherit" onClick={logOut}>
                  Log out
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <div className="wrapper" style={{ margin: "40px 20px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                {session ? (
                  <>
                    <Typography fontSize={16}>
                      Utente: {session.user.email}
                    </Typography>
                    <Divider sx={{ marginBottom: "40px" }} />
                  </>
                ) : null}
                <PhoneScheduler />
              </PrivateRoute>
            }
          />

          <Route path="/create-password" element={<SetPassword />} />
          <Route path="/*" element={<DefaultPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
