import React, { Component } from "react";
import { supabase } from "./database/client";

// Material UI
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {
  Alert,
  AlertTitle,
  Button,
  Chip,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Slider,
  TextField,
} from "@mui/material";
import { Stack } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";

// Utiliy
import { valuetext } from "./utility/formatting";
import {
  AFTERNOON_SHIFT_END,
  AFTERNOON_SHIFT_START,
  ITEM_HEIGHT,
  ITEM_PADDING_TOP,
  marks,
  MORNING_SHIFT_END,
  MORNING_SHIFT_START,
  collaborators,
  EMAIL_HEADER,
  EMAIL_FOOTER,
} from "./utility/constants";
import { useState } from "react";
import htmlToDraft from "html-to-draftjs";

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function Settings(props) {
  const [emailBody, setEmailBody] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <div>
      <Typography variant="h4" fontWeight={600} component="h1" gutterBottom>
        Impostazioni
      </Typography>
      <Grid container>
        <Grid item>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography fontWeight={600} mb={1}>
                Numero di linee
              </Typography>
              <Slider
                sx={{ marginLeft: "10px", width: 300, maxWidth: "100%" }}
                aria-label="Numero di Linee"
                value={props.nrLines}
                onChange={props.handleNrLinesChange}
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                step={1}
                marks={marks}
                min={1}
                max={5}
              />
            </Grid>
            <Grid item maxWidth={"100%"}>
              <Typography fontWeight={600} mb={1}>
                Collaboratori
              </Typography>
              <FormControl sx={{ width: 300, maxWidth: "100%" }}>
                <Select
                  sx={{ maxWidth: "100%" }}
                  multiple
                  value={props.selectedCollaborators}
                  onChange={props.handleCollaboratorsChange}
                  input={<OutlinedInput />}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return "Seleziona...";
                    }
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value.name + value.surname}
                            label={`${value.name} ${value.surname}`}
                          />
                        ))}
                      </Box>
                    );
                  }}
                  MenuProps={MenuProps}
                >
                  <MenuItem disabled value="">
                    Seleziona...
                  </MenuItem>
                  {props.collaborators?.map((collaborator) => (
                    <MenuItem key={collaborator.id} value={collaborator}>
                      {`${collaborator.name} ${collaborator.surname}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Stack>
              <Collapse in={alertOpen}>
                <Alert
                  severity="warning"
                  action={
                    <IconButton
                      aria-label="close"
                      color="inherit"
                      size="small"
                      onClick={() => {
                        setAlertOpen(false);
                      }}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
                  sx={{ mb: 2 }}
                >
                  <AlertTitle>Attenzione</AlertTitle>
                  Il dato inserito nella casella per la durata della linea deve
                  essere <strong>di tipo numerico</strong>
                </Alert>
              </Collapse>
            </Stack>
            <Grid item>
              <Button onClick={props.submit} variant="contained">
                Assegna turni
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
