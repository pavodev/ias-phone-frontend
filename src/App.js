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
  AFTERNOON_SHIFT_END,
  AFTERNOON_SHIFT_START,
  ITEM_HEIGHT,
  ITEM_PADDING_TOP,
  marks,
  MORNING_SHIFT_END,
  MORNING_SHIFT_START,
  names,
} from "./utility/constants";
import DateTimePicker from "react-datetime-picker";
import { getMinuteDifference } from "./utility/utils";

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

    let today = new Date();

    this.state = {
      data: [],

      morningShiftStart: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        MORNING_SHIFT_START[0],
        MORNING_SHIFT_START[1],
        0
      ),
      morningShiftEnd: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        MORNING_SHIFT_END[0],
        MORNING_SHIFT_END[1],
        0
      ),
      afternoonShiftStart: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        AFTERNOON_SHIFT_START[0],
        AFTERNOON_SHIFT_START[1],
        0
      ),
      afternoonShiftEnd: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        AFTERNOON_SHIFT_END[0],
        AFTERNOON_SHIFT_END[1],
        0
      ),

      nrLines: 1,
      lineDuration: 300,
      collaborators: ["Alen Gavranovic", "Ivan Pavic", "Pinco Pallino"],
      alertOpen: false,
      shadePreviousCells: true,
      shadePreviousAppointments: true,
      updateInterval: 10000,
    };
  }

  componentDidMount() {
    this.setState({
      collaborators: [],
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
      collaborators: typeof value === "string" ? value.split(",") : value,
    });
  };

  computeShifts = () => {
    // if (!this.settingsValid()) return;

    const morningLineDuration = getMinuteDifference(
      this.state.morningShiftStart,
      this.state.morningShiftEnd
    );

    const afternoonLineDuration = getMinuteDifference(
      this.state.afternoonShiftStart,
      this.state.afternoonShiftEnd
    );

    const lineDuration = morningLineDuration + afternoonLineDuration;

    const shiftLength =
      (lineDuration * this.state.nrLines) / this.state.collaborators.length;

    let shuffledCollaborators = this.state.collaborators.sort(
      () => Math.random() - 0.5
    );

    let collaboratorCounter = 0;
    let dayCounter = 0;

    // Loop lines
    for (let i = 0; i < this.state.nrLines; i++) {
      let previousLineDiff = 0;
      let morningShifts = [];
      let afternoonShifts = [];

      let startDate = new Date(),
        endDate = new Date();

      console.log("Before pauses computation, shift length", shiftLength);
      console.log(
        this.getD(this.state.afternoonShiftStart),
        this.getD(this.state.morningShiftEnd),
        this.getD(this.state.afternoonShiftStart),
        this.getD(this.state.afternoonShiftEnd)
      );

      // Loop collaborators
      for (let j = collaboratorCounter; j < shuffledCollaborators.length; j++) {
        console.log("---------------------");
        console.log(dayCounter);
        if (dayCounter === 0) {
          startDate = new Date(this.state.morningShiftStart.getTime());
        } else {
          startDate = new Date(endDate.getTime());
        }
        endDate = new Date(
          startDate.getTime() + shiftLength * 60000 - previousLineDiff
        );
        dayCounter = dayCounter + 1;

        console.log(this.getD(startDate), this.getD(endDate));

        // Is in morning shift
        if (
          startDate.getTime() >= this.state.morningShiftStart.getTime() &&
          startDate.getTime() <= this.state.morningShiftEnd.getTime() &&
          endDate.getTime() >= this.state.morningShiftStart.getTime() &&
          endDate.getTime() <= this.state.morningShiftEnd.getTime()
        ) {
          morningShifts.push({
            title: shuffledCollaborators[j],
            startDate,
            endDate,
          });

          console.log(
            "IS IN MORNING SHIFT",
            this.getD(startDate),
            this.getD(endDate)
          );

          break;
        }

        // Is in afternoon shift
        if (
          startDate.getTime() >= this.state.afternoonShiftStart.getTime() &&
          startDate.getTime() <= this.state.afternoonShiftEnd.getTime() &&
          endDate.getTime() >= this.state.afternoonShiftStart.getTime() &&
          endDate.getTime() <= this.state.afternoonShiftEnd.getTime()
        ) {
          afternoonShifts.push({
            title: shuffledCollaborators[j],
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          });

          console.log(
            "IS IN AFTERNOON",
            this.getD(startDate),
            this.getD(endDate)
          );

          break;
        }

        // Is partially in the morning, partially in the afternoon
        if (
          startDate.getTime() >= this.state.morningShiftStart.getTime() &&
          startDate.getTime() <= this.state.morningShiftEnd.getTime() &&
          endDate.getTime() > this.state.morningShiftEnd.getTime()
        ) {
          let diff = Math.abs(
            endDate.getTime() - this.state.morningShiftEnd.getTime()
          );

          let partialDate1 = new Date(
            this.state.morningShiftEnd.getTime() - diff
          );
          let partialDate2 = new Date(
            this.state.afternoonShiftStart.getTime() + diff
          );

          if (
            new Date(startDate).getTime() !==
            this.state.morningShiftEnd.getTime()
          ) {
            console.log(
              "ARE THEY EQUAL: ",
              startDate.getTime(),
              this.state.morningShiftEnd.getTime()
            );
            morningShifts.push({
              title: shuffledCollaborators[j],
              startDate: new Date(startDate),
              endDate: new Date(this.state.morningShiftEnd),
            });
          }

          afternoonShifts.push({
            title: shuffledCollaborators[j],
            startDate: new Date(this.state.afternoonShiftStart),
            endDate: new Date(partialDate2),
          });

          // Update
          startDate = new Date(this.state.afternoonShiftStart);
          endDate = new Date(partialDate2);

          console.log(
            "IS PARTIALLY IN MORNING",
            this.getD(startDate),
            this.getD(endDate)
          );

          continue;
        }

        // Is partially in the afternoon
        if (
          startDate.getTime() >= this.state.afternoonShiftStart.getTime() &&
          startDate.getTime() <= this.state.afternoonShiftEnd.getTime() &&
          endDate.getTime() > this.state.afternoonShiftEnd.getTime()
        ) {
          // Next line, exclude the collaborators that have already been assigned a shift
          collaboratorCounter = j;

          let diff = Math.abs(
            endDate.getTime() - this.state.afternoonShiftEnd.getTime()
          );

          afternoonShifts.push({
            title: shuffledCollaborators[j],
            startDate: new Date(startDate),
            endDate: startDate.getTime() + diff,
          });

          dayCounter = 0;
          previousLineDiff = diff;

          break;
        }

        previousLineDiff = 0;
      }
      this.setState((prevState) => ({
        data: [...prevState.data, [...morningShifts, ...afternoonShifts]],
      }));

      console.log(`LINE ${i}`, [...morningShifts, ...afternoonShifts]);
    }
  };

  computeShifts2 = () => {
    const morningLineDuration = getMinuteDifference(
      this.state.morningShiftStart,
      this.state.morningShiftEnd
    );

    const afternoonLineDuration = getMinuteDifference(
      this.state.afternoonShiftStart,
      this.state.afternoonShiftEnd
    );

    console.log(`MorningLineDuration: ${morningLineDuration}`);
    console.log(`AfternoonLineDuration: ${afternoonLineDuration}`);

    const lineDuration = morningLineDuration + afternoonLineDuration;
    const shiftLength =
      (lineDuration * this.state.nrLines) / this.state.collaborators.length;

    console.log(
      `Total line duration: ${lineDuration}, shift length: ${shiftLength}`
    );

    let shuffledCollaborators = this.state.collaborators.sort(
      () => Math.random() - 0.5
    );

    shuffledCollaborators = shuffledCollaborators.map((collaborator) => {
      return {
        name: collaborator,
        shiftMinutes: shiftLength,
      };
    });

    let morningShifts = []; // first position is for the morning shifts of the first day, second position...
    let afternoonShifts = [];

    for (let i = 0; i < this.state.nrLines; i++) {
      let numberOfShiftsInLine = lineDuration / shiftLength;
      console.log(`Line ${i + 1} has ${numberOfShiftsInLine} shifts`);

      // 0 - 180 / 180 - 300
      let currentLineMorningDuration = morningLineDuration;
      let currentLineAfternoonDuration = afternoonLineDuration;
      let timeCounter = 0;

      // 0 + 100 <= 180 ? --> [100][]
      // 100 + 100 <= 180 ? --> NO
      // 80 > 0 --> YES
      // [100, 80][100-80]
      // 100 - 80
      while (timeCounter + shiftLength <= morningLineDuration) {
        let shift = shiftLength;
        timeCounter += shiftLength;
        currentLineMorningDuration -= shift;
        morningShifts.push(shift);
      }

      if (currentLineMorningDuration > 0) {
        morningShifts.push(currentLineMorningDuration); // push the first part of the shift in the morning
        afternoonShifts.push(shiftLength - currentLineMorningDuration); // push the remaining part in the afternoon
        timeCounter += shiftLength;
        currentLineAfternoonDuration -=
          shiftLength - currentLineMorningDuration;
      }

      console.log(morningShifts, afternoonShifts);

      // 200 + 100 <= 300 ? --> [100, 20][80, 100]

      while (timeCounter + shiftLength <= lineDuration) {
        let shift = shiftLength;
        timeCounter += shiftLength;
        currentLineAfternoonDuration -= shift;
        afternoonShifts.push(shift);
      }

      console.log(afternoonShifts);
    }
  };

  getD = (d) => {
    d = new Date(d);
    return `${d.getHours()}:${d.getMinutes()}`;
  };

  settingsValid = () => {
    const { nrLines, lineDuration, collaborators } = this.state;

    if (isNaN(lineDuration) || collaborators.length < 1) {
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
      collaborators,
      alertOpen,
    } = this.state;

    console.log("DATA", data);

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
            {/* <DateTimePicker /> */}
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
                  value={collaborators}
                  onChange={this.handleChange}
                  input={<OutlinedInput />}
                  renderValue={(selected) => {
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
              <Button onClick={this.computeShifts2} variant="contained">
                Assegna turni
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ marginTop: "40px" }} />
        <Grid my={4}>
          <Typography variant="h4" fontWeight={600} component="h1" gutterBottom>
            Turni
          </Typography>
        </Grid>
        <Grid
          my={4}
          maxWidth={1100}
          justifyContent="center"
          alignItems="center"
        >
          <Grid container spacing={2}>
            {[...Array(nrLines)].map((e, i) => {
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
                    <Scheduler data={data[i]}>
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
