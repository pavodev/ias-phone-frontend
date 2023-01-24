import * as React from "react";

// Material UI
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import { Divider, Grid } from "@mui/material";

// React Scheduler
import {
  Scheduler,
  DayView,
  Appointments,
  AppointmentTooltip,
} from "@devexpress/dx-react-scheduler-material-ui";

import {
  AppointmentForm,
  CurrentTimeIndicator,
  ViewState,
} from "@devexpress/dx-react-scheduler";

// React Date-time picker
import DateTimePicker from "react-datetime-picker";

// CONSTANTS
// TODO allow users to get this data from the database API
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

// UTILS
import { getMinuteDifference } from "./utility/utils";

// COMPONENTS
import Settings from "./Settings";
import { Copyright } from "./Copyright";
import { supabase } from "./database/client";

const currentDate = new Date();

// Appointment component
export const Appointment = ({ children, style, data, ...restProps }) => (
  <Appointments.Appointment
    {...restProps}
    data={data}
    style={{
      ...style,
      backgroundColor: data.color,
      color: data.color,
    }}
  >
    {children}
  </Appointments.Appointment>
);

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
      selectedCollaborators: [],
      shadePreviousCells: true,
      shadePreviousAppointments: true,
      updateInterval: 10000,
    };
  }

  async componentDidMount() {
    const { data, error } = await supabase.from("collaborators").select();
    console.log(data);
    if (!error) {
      this.setState({ collaborators: data });
    }
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
    console.log(event);
    const {
      target: { value },
    } = event;
    this.setState({
      // On autofill we get a stringified value.
      selectedCollaborators:
        typeof value === "string" ? value.split(",") : value,
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
      (lineDuration * this.state.nrLines) /
      this.state.selectedCollaborators.length;

    console.log(
      `Total line duration: ${lineDuration}, shift length: ${shiftLength}`
    );

    let shuffledCollaborators = this.state.selectedCollaborators.sort(
      () => Math.random() - 0.5
    );
    console.log("THESE WERE SELECTED: ", this.state.selectedCollaborators);

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
      });

      splittedLineShifts.push([morningShifts, afternoonShifts]);
      computedShifts.push(currentLineComputedShifts);
    });

    // ASSIGN DATA

    let collaboratorCounter = 0;
    let shiftMinutesCounter = 0;
    let currentCollaborator = null;

    for (let i = 0; i < this.state.nrLines; i++) {
      let morningShiftsDates = [];
      let afternoonShiftsDates = [];
      let startingDate = this.state.morningShiftStart;
      currentCollaborator = shuffledCollaborators[collaboratorCounter];

      splittedLineShifts[i][0].forEach((shift) => {
        shiftMinutesCounter += shift;
        console.log("morning: ", shiftMinutesCounter);

        if (shiftMinutesCounter >= shiftLength) {
          shiftMinutesCounter = 0;
          currentCollaborator = shuffledCollaborators[collaboratorCounter];
          collaboratorCounter++;
          console.log("NEW COLLABORATOR: ", collaboratorCounter);
        } else {
          currentCollaborator = shuffledCollaborators[collaboratorCounter];
        }

        morningShiftsDates.push({
          title: `${currentCollaborator.name} ${currentCollaborator.surname}`,
          color: currentCollaborator.color,
          startDate: startingDate,
          endDate: new Date(startingDate.getTime() + shift * 60000),
        });

        startingDate = new Date(startingDate.getTime() + shift * 60000);
      });

      startingDate = this.state.afternoonShiftStart;

      splittedLineShifts[i][1].forEach((shift) => {
        shiftMinutesCounter += shift;
        console.log("afternoon: ", shiftMinutesCounter);

        if (shiftMinutesCounter >= shiftLength) {
          shiftMinutesCounter = 0;
          currentCollaborator = shuffledCollaborators[collaboratorCounter];
          collaboratorCounter++;
          console.log("NEW COLLABORATOR: ", collaboratorCounter);
        } else {
          currentCollaborator = shuffledCollaborators[collaboratorCounter];
        }

        afternoonShiftsDates.push({
          title: `${currentCollaborator.name} ${currentCollaborator.surname}`,
          color: currentCollaborator.color,
          startDate: startingDate,
          endDate: new Date(startingDate.getTime() + shift * 60000),
        });

        startingDate = new Date(startingDate.getTime() + shift * 60000);
      });

      console.log([[...morningShiftsDates, ...afternoonShiftsDates]]);
      this.setState((prevState) => ({
        data: [
          ...prevState.data,
          [...morningShiftsDates, ...afternoonShiftsDates],
        ],
      }));
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
      shifts.push(currentMinutePosition + shiftLength);
      currentMinutePosition = currentMinutePosition + shiftLength;
    }

    // Reached the end, check if we consumed the time in this line
    if (currentMinutePosition != afternoonEndMinute) {
      shifts.push(afternoonEndMinute);
      return {
        shifts,
        remaining: shiftLength - (afternoonEndMinute - currentMinutePosition),
      };
    }

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
      <Container maxWidth="100%" margin={4}>
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
        <Box maxWidth="100%">
          <Settings
            nrLines={nrLines}
            handleNrLinesChange={this.handleNrLinesChange}
            collaborators={this.state.selectedCollaborators}
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
        <Grid m={1} w={"100%"} justifyContent="center" alignItems="center">
          <Grid container spacing={2}>
            {[...Array(nrLines)].map((e, i) => {
              return (
                <Grid item xs={12} sm={4} key={i}>
                  <Paper>
                    <Typography
                      variant="h5"
                      padding="10px 0 10px 10px"
                      fontWeight={600}
                      component="h1"
                      gutterBottom
                    >
                      Linea {i + 1}
                    </Typography>
                    <Scheduler locale={locale} data={data[i]}>
                      <ViewState currentDate={currentDate} />
                      <DayView startDayHour={8} endDayHour={16.5} />
                      <Appointments appointmentComponent={Appointment} />
                      <AppointmentTooltip />
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
        <Copyright />
      </Container>
    );
  }
}
