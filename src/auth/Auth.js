import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Button,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Snackbar,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { supabase } from "../database/client";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      setErrorMessage(error.error_description || error.message);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickShowPassword = () =>
    setShowPassword((showPassword) => !showPassword);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <div className="container mx-auto text-center w-72">
      <div className="col-6 form-widget" aria-live="polite">
        {loading ? (
          "Sto effettuando il login..."
        ) : (
          <form onSubmit={handleLogin}>
            <Grid
              container
              spacing={3}
              alignItems="center"
              justify="center"
              direction="column"
            >
              <h1>Accedi</h1>
              <Grid item>
                <FormControl
                  sx={{ m: 1, width: "25ch" }}
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                >
                  <InputLabel htmlFor="email-input">Email</InputLabel>
                  <OutlinedInput
                    id="email-input"
                    type="email"
                    label="Email"
                    aria-describedby="my-helper-text"
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl
                  sx={{ m: 1, width: "25ch" }}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                >
                  <InputLabel htmlFor="outlined-adornment-password">
                    Password
                  </InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <Button color="primary" variant="contained" type="submit">
                  Login
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </div>
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
