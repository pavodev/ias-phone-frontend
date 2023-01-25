import { Button, Grid, Input, TextField } from "@mui/material";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./Auth";

export function Signup() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  // Get signUp function from the auth context
  const { signUp } = useAuth();

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    // Calls `signUp` function from the context
    const { error } = await signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      // Redirect user to Dashboard
      navigate("/");
    }
  }

  function onEmailChange(e) {
    setEmail(e.target.value);
  }
  function onPasswordChange(e) {
    setPassword(e.target.value);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid
          container
          spacing={3}
          alignItems="center"
          justify="center"
          direction="column"
        >
          <h1>Crea un nuovo account</h1>
          <Grid item>
            <TextField
              type="email"
              placeholder="Email"
              onChange={onEmailChange}
            />
          </Grid>
          <Grid item>
            <TextField
              type="password"
              placeholder="Password"
              onChange={onPasswordChange}
            />
          </Grid>
          <Grid item>
            <Button color="primary" variant="contained" type="submit">
              Registra
            </Button>
          </Grid>
        </Grid>
      </form>
      <Grid container alignItems="center" justify="center" direction="column">
        <Grid item>
          <p>
            Hai già un account? <Link to="/login">Log In</Link>
          </p>
        </Grid>
      </Grid>
    </>
  );
}
