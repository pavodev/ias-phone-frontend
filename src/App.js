import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

import Paper from "@mui/material/Paper";
import {
  AppointmentForm,
  AppointmentTooltip,
  CurrentTimeIndicator,
  ViewState,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  DayView,
  Appointments,
} from "@devexpress/dx-react-scheduler-material-ui";
import { Divider, Grid } from "@mui/material";

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
import DateTimePicker from "react-datetime-picker";
import { getMinuteDifference } from "./utility/utils";
import Settings from "./Settings";

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

export default class App extends React.PureComponent {
  constructor(props) {
    super(props);

    let today = new Date();

    this.state = {
      data: [],
      locale: "it-IT",
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

      nrLines: 2,
      lineDuration: 300,
      collaborators: collaborators,
      shadePreviousCells: true,
      shadePreviousAppointments: true,
      updateInterval: 10000,
    };
  }

  componentDidMount() {
    // this.setState({
    //   collaborators: [],
    // });
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

  handleCollaboratorsChange = (event) => {
    const {
      target: { value },
    } = event;
    this.setState({
      // On autofill we get a stringified value.
      collaborators: typeof value === "string" ? value.split(",") : value,
    });
  };

  roundToDecimal = (value) => {
    return Math.round(value);
  };

  computeShifts = () => {
    this.setState({ data: [] });
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

    console.log(
      `Total line duration: ${lineDuration}, shift length: ${shiftLength}`
    );

    let shuffledCollaborators = this.state.collaborators.sort(
      () => Math.random() - 0.5
    );

    shuffledCollaborators = shuffledCollaborators.map((collaborator) => {
      return {
        name: collaborator.name,
        shiftMinutes: shiftLength,
      };
    });

    let previousLineRemaining = 0;
    let lineShifts = [];
    for (let i = 0; i < this.state.nrLines; i++) {
      let result = this.consumeLine(shiftLength, previousLineRemaining);
      previousLineRemaining = result.remaining;
      console.log(
        `Line ${i} shifts: ${result.shifts}, \nRemaining time: ${previousLineRemaining}`
      );

      lineShifts.push(result.shifts);
    }

    // Split in mornings and afternoons
    let splittedLineShifts = [];
    let computedShifts = [];

    lineShifts.forEach((shifts) => {
      let minuteCounter = 0;
      let morningShifts = [];
      let afternoonShifts = [];
      let currentLineComputedShifts = [];

      for (let i = 0; i < shifts.length; i++) {
        if (i === 0) {
          currentLineComputedShifts.push(shifts[i]);
        } else {
          currentLineComputedShifts.push(shifts[i] - shifts[i - 1]);
        }
      }

      currentLineComputedShifts.forEach((shift) => {
        // 200
        let nextShift = minuteCounter + shift; // 0 + 200 = 200
        if (nextShift <= morningLineDuration) {
          // 200 <= 180 --> No
          console.log("mc + s = ", nextShift);
          morningShifts.push(shift);
          minuteCounter += shift;
          if (minuteCounter === lineDuration) minuteCounter = 0;
          nextShift = 0; // avoid the last if statement
        } else if (minuteCounter < morningLineDuration) {
          let remaining = shift - (morningLineDuration - minuteCounter); // 200 - (180 - 0) = 20
          morningShifts.push(morningLineDuration - minuteCounter); // 180
          afternoonShifts.push(remaining); // 20
          minuteCounter += shift; //
          if (minuteCounter === lineDuration) minuteCounter = 0;
          nextShift = 0; // avoid the last if statement
        } else {
          afternoonShifts.push(shift);
          minuteCounter += shift;
          if (minuteCounter === lineDuration) minuteCounter = 0;
        }

        // if (
        //   nextShift >= this.state.afternoonShiftStart &&
        //   nextShift <= lineDuration
        // ) {
        //   afternoonShifts.push(shift);
        //   minuteCounter += shift;
        //   if (minuteCounter === lineDuration) minuteCounter = 0;
        // }
      });

      splittedLineShifts.push([morningShifts, afternoonShifts]);
      computedShifts.push(currentLineComputedShifts);
    });

    // ASSIGN DATA

    let collaboratorCounter = 0;
    let shiftMinutesCounter = 0;

    for (let i = 0; i < this.state.nrLines; i++) {
      let morningShiftsDates = [];
      let afternoonShiftsDates = [];
      let startingDate = this.state.morningShiftStart;

      splittedLineShifts[i][0].forEach((shift) => {
        morningShiftsDates.push({
          title: shuffledCollaborators[collaboratorCounter].name,
          startDate: startingDate,
          endDate: new Date(startingDate.getTime() + shift * 60000),
        });

        shiftMinutesCounter += shift;
        if (shiftMinutesCounter === shiftLength) {
          shiftMinutesCounter = 0;
          collaboratorCounter++;
        }

        startingDate = new Date(startingDate.getTime() + shift * 60000);
      });

      startingDate = this.state.afternoonShiftStart;

      splittedLineShifts[i][1].forEach((shift) => {
        afternoonShiftsDates.push({
          title: shuffledCollaborators[collaboratorCounter].name,
          startDate: startingDate,
          endDate: new Date(startingDate.getTime() + shift * 60000),
        });

        shiftMinutesCounter += shift;
        if (shiftMinutesCounter === shiftLength) {
          shiftMinutesCounter = 0;
          collaboratorCounter++;
        }
        startingDate = new Date(startingDate.getTime() + shift * 60000);
      });

      this.setState((prevState) => ({
        data: [
          ...prevState.data,
          [...morningShiftsDates, ...afternoonShiftsDates],
        ],
      }));

      // console.log(morningShiftsDates, afternoonShiftsDates);
      // console.log(this.state.data);
      console.log(`LINE ${i}`, [
        ...morningShiftsDates,
        ...afternoonShiftsDates,
      ]);
    }

    console.log(splittedLineShifts, computedShifts);
  };

  consumeLine = (shiftLength = 0, previousLineRemaining = 0) => {
    const morningLineDuration = getMinuteDifference(
      this.state.morningShiftStart,
      this.state.morningShiftEnd
    );

    const afternoonLineDuration = getMinuteDifference(
      this.state.afternoonShiftStart,
      this.state.afternoonShiftEnd
    );

    let morningEndMinute = morningLineDuration;
    let afternoonEndMinute = morningEndMinute + afternoonLineDuration;

    // console.log(morningEndMinute, afternoonEndMinute);

    let currentMinutePosition = 0;
    let shifts = [];

    if (previousLineRemaining > 0) {
      if (previousLineRemaining <= afternoonEndMinute) {
        shifts.push(previousLineRemaining);
        currentMinutePosition = previousLineRemaining;
      } else {
        shifts.push(afternoonEndMinute);
        return {
          shifts,
          remaining: previousLineRemaining - afternoonEndMinute,
        };
      }
    }

    while (currentMinutePosition + shiftLength <= afternoonEndMinute) {
      // console.log(currentMinutePosition + shiftLength);
      shifts.push(currentMinutePosition + shiftLength);
      currentMinutePosition = currentMinutePosition + shiftLength;
    }

    // Reached the end, check if we consumed the time in this line
    if (currentMinutePosition != afternoonEndMinute) {
      shifts.push(afternoonEndMinute);

      // console.log(
      //   shifts,
      //   shiftLength - (afternoonEndMinute - currentMinutePosition)
      // );

      return {
        shifts,
        remaining: shiftLength - (afternoonEndMinute - currentMinutePosition),
      };
    }

    // console.log(shifts);

    return {
      shifts,
      remaining: 0,
    };
  };

  checkIfValid() {}

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
      locale,
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
        <Divider sx={{ marginTop: "40px", marginBottom: "40px" }} />
        <Box width={400}>
          <Settings
            nrLines={nrLines}
            handleNrLinesChange={this.handleNrLinesChange}
            collaborators={this.state.collaborators}
            handleCollaboratorsChange={this.handleCollaboratorsChange}
            lineDuration={this.state.lineDuration}
            handleLineDurationChange={this.handleLineDurationChange}
            submit={this.computeShifts}
          />
        </Box>
        <Divider sx={{ marginTop: "40px" }} />
        <Grid my={4}>
          <Typography variant="h4" fontWeight={600} component="h1" gutterBottom>
            Turni
          </Typography>
        </Grid>
        <Grid my={4} w={"100&"} justifyContent="center" alignItems="center">
          <Grid container spacing={2}>
            {[...Array(nrLines)].map((e, i) => {
              return (
                <Grid item xs={12} sm={4} key={i}>
                  <Paper>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      component="h1"
                      gutterBottom
                    >
                      Linea {i + 1}
                    </Typography>
                    <Scheduler locale={locale} data={data[i]}>
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
