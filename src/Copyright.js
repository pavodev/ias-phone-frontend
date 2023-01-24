import { Link, Typography } from "@mui/material";

export function Copyright() {
  return (
    <Typography p="20px" variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://github.com/pavodev">
        Ivan Pavic
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
