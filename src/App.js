import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

import Paper from "@mui/material/Paper";
import {
  CurrentTimeIndicator,
  ViewState,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  DayView,
  Appointments,
} from "@devexpress/dx-react-scheduler-material-ui";
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
  ITEM_HEIGHT,
  ITEM_PADDING_TOP,
  marks,
  names,
} from "./utility/constants";

const currentDate = new Date();

const minutes = 300;
const lines = 2;

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {
          startDate: "2022-08-24T09:45",
          endDate: "2022-08-24T11:00",
          title: "Meeting",
        },
        {
          startDate: "2022-08-24T12:00",
          endDate: "2022-08-24T13:30",
          title: "Go to a gym",
        },
      ],
      nrLines: 1,
      lineDuration: 300,
      personName: [],
      alertOpen: false,
      shadePreviousCells: true,
      shadePreviousAppointments: true,
      updateInterval: 10000,
    };
  }

  componentDidMount() {
    this.setState({
      personName: [],
    });
  }
  handleNrLinesChange = (event) => {
    const {
      target: { value },
    } = event;

    this.setState({ nrLines: value });
  };

  handleLineDurationChange = (event) => {
    const {
      target: { value },
    } = event;

    this.setState({ lineDuration: value });
  };

  handleChange = (event) => {
    const {
      target: { value },
    } = event;
    this.setState({
      // On autofill we get a stringified value.
      personName: typeof value === "string" ? value.split(",") : value,
    });
  };

  computeShifts = () => {
    if (!this.settingsValid()) return;

    console.log(
      this.state.nrLines,
      this.state.lineDuration,
      this.state.personName
    );
  };

  settingsValid = () => {
    const { nrLines, lineDuration, personName } = this.state;

    if (isNaN(lineDuration) || personName.length === 0) {
      return false;
    }

    return true;
  };

  render() {
    const {
      data,
      shadePreviousCells,
      updateInterval,
      shadePreviousAppointments,
      nrLines,
      lineDuration,
      personName,
      alertOpen,
    } = this.state;

    return (
      <Container maxWidth="500" margin={4}>
        <Typography
          variant="h2"
          fontWeight={700}
          my={4}
          component="h1"
          gutterBottom
        >
          IAS Turni telefono
        </Typography>
        <Box width={400}>
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
                value={nrLines}
                onChange={this.handleNrLinesChange}
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                step={1}
                marks={marks}
                min={1}
                max={5}
              />
            </Grid>
            <Divider />
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12} maxWidth={1000}>
              <Typography fontWeight={600} mb={1}>
                Collaboratori
              </Typography>
              <FormControl sx={{ width: 400 }}>
                <Select
                  multiple
                  displayEmpty
                  value={personName}
                  onChange={this.handleChange}
                  input={<OutlinedInput />}
                  renderValue={(selected) => {
                    console.log(selected.length);
                    if (selected.length === 0) {
                      return "Seleziona...";
                    }
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    );
                  }}
                  MenuProps={MenuProps}
                >
                  <MenuItem disabled value="">
                    Seleziona...
                  </MenuItem>
                  {names.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
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
              <Button onClick={this.computeShifts} variant="contained">
                Assegna turni
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ marginTop: "40px" }} />
        <Grid my={4}>
          <Typography variant="h4" fontWeight={600} component="h1" gutterBottom>
            IAS Phone scheduler
          </Typography>
        </Grid>
        <Grid
          my={4}
          maxWidth={1100}
          justifyContent="center"
          alignItems="center"
        >
          <Grid container spacing={2}>
            {[...Array(4)].map((e, i) => {
              return (
                <Grid item xs={12} sm={6} key={i}>
                  <Paper>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      component="h1"
                      gutterBottom
                    >
                      Linea {i + 1}
                    </Typography>
                    <Scheduler data={data}>
                      <ViewState currentDate={currentDate} />
                      <DayView startDayHour={8} endDayHour={16.5} />
                      <Appointments />
                      <CurrentTimeIndicator
                        shadePreviousCells={shadePreviousCells}
                        shadePreviousAppointments={shadePreviousAppointments}
                        updateInterval={updateInterval}
                      />
                    </Scheduler>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Container>
    );
  }
}
