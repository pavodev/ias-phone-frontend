import React, { Component } from "react";
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

import { valuetext } from "./utility/formatting";
import { Stack } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";

import {
  AFTERNOON_SHIFT_END,
  AFTERNOON_SHIFT_START,
  ITEM_HEIGHT,
  ITEM_PADDING_TOP,
  marks,
  MORNING_SHIFT_END,
  MORNING_SHIFT_START,
  collaborators,
} from "./utility/constants";
import { supabase } from "./database/client";

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alertOpen: false,
      collaboratorsList: [],
    };
  }

  async componentDidMount() {
    const { data, error } = await supabase.from("collaborators").select();
    if (!error) {
      this.setState({ collaboratorsList: data });
    }
  }

  render() {
    return (
      <div>
        <Typography variant="h4" fontWeight={600} component="h1" gutterBottom>
          Impostazioni
        </Typography>
        <Grid container spacing={2} pl={3} pt={3}>
          <Grid item xs={12}>
            <Typography fontWeight={600} mb={1}>
              Numero di linee
            </Typography>
            <Slider
              sx={{ marginLeft: "10px", width: 300 }}
              aria-label="Numero di Linee"
              value={this.props.nrLines}
              onChange={this.props.handleNrLinesChange}
              getAriaValueText={valuetext}
              valueLabelDisplay="auto"
              step={1}
              marks={marks}
              min={1}
              max={5}
            />
          </Grid>
          <Divider />
          {/* <DateTimePicker /> */}
          {/* <Grid item xs={12}>
        <Typography fontWeight={600} mb={1}>
          Minuti per linea
        </Typography>
        <TextField
          value={lineDuration}
          sx={{ width: 400 }}
          size="small"
          onChange={this.handleLineDurationChange}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
      </Grid> */}
          <Grid item xs={12} maxWidth={1000}>
            <Typography fontWeight={600} mb={1}>
              Collaboratori
            </Typography>
            <FormControl sx={{ width: 400 }}>
              <Select
                multiple
                value={this.props.collaborators}
                onChange={this.props.handleCollaboratorsChange}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return "Seleziona...";
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value.name}
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
                {this.state.collaboratorsList.map((collaborator) => (
                  <MenuItem key={collaborator.id} value={collaborator}>
                    {`${collaborator.name} ${collaborator.surname}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Stack>
            <Collapse in={this.state.alertOpen}>
              <Alert
                severity="warning"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      this.setState({ alertOpen: false });
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
          <Grid item xs={12} mt={4}>
            <Button onClick={this.props.submit} variant="contained">
              Assegna turni
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }
}
