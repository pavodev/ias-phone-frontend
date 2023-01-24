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
      collaborators: [
        "Alen Gavranovic",
        "Ivan Pavic",
        "Pinco Pallino",
        "Lionel Messi",
        "Cristiano Ronaldo",
      ],
      alertOpen: false,
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
        name: collaborator,
        shiftMinutes: shiftLength,
      };
    });

    let morningShifts = []; // first position is for the morning shifts of the first day, second position...
    let afternoonShifts = [];
    let previousLineRemainingTime = 0;

    for (let i = 0; i < this.state.nrLines; i++) {
      let numberOfShiftsInLine = lineDuration / shiftLength;
      console.log(`--------------- LINE ${i} --------------`);
      console.log(`Line ${i + 1} has ${numberOfShiftsInLine} shifts`);
      console.log(
        `Morning has ${morningLineDuration / shiftLength}\nAfternoon has ${
          afternoonLineDuration / shiftLength
        }`
      );

      // 2ND VERSION

      // // 0.9 + 0.6 / 0.9 + 0.6
      // let nrMShifts = morningLineDuration / shiftLength;
      // let nrAShifts = afternoonLineDuration / shiftLength;
      // let currentMShifts = [];
      // let currentAShifts = [];

      // if (nrMShifts < 1) {
      //   currentMShifts.push(nrMShifts * shiftLength);
      //   currentAShifts.push((1 - nrMShifts) * shiftLength);
      //   nrAShifts = nrAShifts - (1 - nrMShifts);
      //   currentAShifts.push(nrAShifts * shiftLength);
      // }

      // if (nrMShifts >= 1 && nrMShifts < 2) {
      //   currentMShifts.push(shiftLength);
      //   currentAShifts.push((nrMShifts - 1) * shiftLength);
      // }

      // 1ST VERSION

      // 0 - 180 / 180 - 300
      let currentLineMorningDuration = morningLineDuration;
      let currentLineAfternoonDuration = afternoonLineDuration;
      let currentLineMorningShifts = [];
      let currentLineAfternoonShifts = [];
      let timeCounter = previousLineRemainingTime;
      previousLineRemainingTime = 0;

      console.log("Time counter: ", timeCounter);

      // 0 + 100 <= 180 ? --> [100][]
      // 100 + 100 <= 180 ? --> NO
      // 80 > 0 --> YES
      // [100, 80][100-80]
      // 100 - 80

      // Consume previous line remaining time
      if (timeCounter > 0 && timeCounter <= morningLineDuration) {
        console.log("Add remaning previous shift amount");
        currentLineMorningDuration -= timeCounter;
        currentLineMorningShifts.push(timeCounter);
      }

      while (timeCounter + shiftLength <= morningLineDuration) {
        console.log(`Morning Shift length: ${timeCounter + shiftLength}`);
        let shift = shiftLength;
        timeCounter += shiftLength;
        currentLineMorningDuration -= shift;
        currentLineMorningShifts.push(shift);
      }

      timeCounter = 0;

      if (currentLineMorningDuration > 0) {
        console.log(
          "Current Line Morning Duration: ",
          currentLineMorningDuration
        );
        currentLineMorningShifts.push(currentLineMorningDuration); // push the first part of the shift in the morning
        currentLineAfternoonShifts.push(
          shiftLength - currentLineMorningDuration
        ); // push the remaining part in the afternoon
        timeCounter += shiftLength - currentLineMorningDuration;
        currentLineAfternoonDuration -=
          shiftLength - currentLineMorningDuration;
      }

      // console.log(currentLineMorningShifts, currentLineAfternoonShifts);

      // 200 + 100 <= 300 ? --> [100, 20][80, 100]

      console.log(
        "TIME LEFT IN THE AFTERNOON: ",
        timeCounter,
        shiftLength,
        currentLineAfternoonDuration
      );

      while (timeCounter + shiftLength <= afternoonLineDuration) {
        console.log(`Afternoon Shift length: ${timeCounter + shiftLength}`);
        let shift = shiftLength;
        timeCounter += shiftLength;
        currentLineAfternoonDuration -= shift;
        currentLineAfternoonShifts.push(shift);
      }

      if (currentLineAfternoonDuration > 0) {
        if (shiftLength > currentLineAfternoonDuration) {
          console.log("NEED TO SPLIT THE SHIFT");
          previousLineRemainingTime =
            shiftLength - currentLineAfternoonDuration;
          currentLineAfternoonShifts.push(
            shiftLength - currentLineAfternoonDuration
          );
        } else {
          console.log("must split the shift in two lines");
          previousLineRemainingTime = 0;
          currentLineAfternoonShifts.push(shiftLength);
        }
      }

      morningShifts.push(currentLineMorningShifts);
      afternoonShifts.push(currentLineAfternoonShifts);
    }
    console.log(morningShifts, afternoonShifts);

    // ASSIGN DATA

    let collaboratorCounter = 0;
    let shiftMinutesCounter = 0;

    for (let i = 0; i < this.state.nrLines; i++) {
      let morningShiftsDates = [];
      let afternoonShiftsDates = [];
      let startingDate = this.state.morningShiftStart;

      morningShifts[i].forEach((shift) => {
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

      afternoonShifts[i].forEach((shift) => {
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
  };

  computeShifts3 = () => {
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
    const nrShifts = lineDuration / shiftLength;
    const nrMorningShifts = morningLineDuration / shiftLength;
    const nrAfternoonShifts = afternoonLineDuration / shiftLength;

    console.log(`MorningLineDuration: ${morningLineDuration}`);
    console.log(`AfternoonLineDuration: ${afternoonLineDuration}`);
    console.log(
      `Total line duration: ${lineDuration}, shift length: ${shiftLength}`
    );
    console.log(`Number of shifts: ${nrShifts}`);
    console.log(
      `Number of morning/afternoon shifts: ${nrMorningShifts}/${nrAfternoonShifts}`
    );

    let shuffledCollaborators = this.state.collaborators.sort(
      () => Math.random() - 0.5
    );

    shuffledCollaborators = shuffledCollaborators.map((collaborator) => {
      return {
        name: collaborator,
        shiftLength,
        hasMorningShift: 0,
        hasAfternoonShift: 0,
        hasSplitLineShift: 0,
      };
    });
    console.log(`Collaborators`, shuffledCollaborators);

    let morningShifts = []; // first position is for the morning shifts of the first day, second position...
    let afternoonShifts = [];
    let previousLineRemainingTime = 0;

    // is in the morning
    // is in the afternoon
    // is partially in the morning and partially in the afternoon

    let startAfternoon = this.getD(this.state.afternoonShiftStart);
    let endAfternoon = this.getD(this.state.afternoonShiftEnd);
    let startMorning = this.getD(this.state.morningShiftStart);
    let endMorning = this.getD(this.state.morningShiftEnd);

    let shift = [];

    let currentLineDuration = lineDuration;
    let currentStartTime = this.state.morningShiftStart;

    while (currentLineDuration > 0) {
      console.log("current start time: ", currentStartTime);
      let nextShift = currentStartTime.getTime() + shiftLength * 60000;

      // It's in the morning
      if (nextShift <= this.state.morningShiftEnd.getTime()) {
        currentStartTime = new Date(
          currentStartTime.getTime() + shiftLength * 60000
        );
        console.log("It's in the morning!");
      }

      // It's in the afternoon
      else if (
        nextShift >= this.state.afternoonShiftStart.getTime() &&
        nextShift <= this.state.afternoonShiftEnd.getTime()
      ) {
        currentStartTime = new Date(
          currentStartTime.getTime() + shiftLength * 60000
        );
        console.log("It's in the afternoon!");
      } else if (nextShift >= this.morningShiftEnd) {
        console.log("Partially in the morning and afternoon");
      } else {
        currentStartTime = new Date(
          currentStartTime.getTime() + shiftLength * 60000
        );
      }

      currentLineDuration = currentLineDuration - shiftLength;
    }
  };

  roundToDecimal = (value) => {
    return Math.round(value);
  };

  computeShifts4 = () => {
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
        name: collaborator,
        shiftMinutes: shiftLength,
      };
    });

    let morningShifts = []; // first position is for the morning shifts of the first day, second position...
    let afternoonShifts = [];
    let previousLineRemainingTime = 0;

    for (let i = 0; i < this.state.nrLines; i++) {
      let morningShiftCounter = 0;
      let afternoonShiftCounter = 0;

      let currentLineMorningShifts = [];
      let currentLineAfternoonShifts = [];
      let numberOfShiftsInLine = this.roundToDecimal(
        lineDuration / shiftLength
      );
      let numberOfShiftsMorning = morningLineDuration / shiftLength;

      let numberOfShiftsAfternoon = afternoonLineDuration / shiftLength;

      console.log(`--------------- LINE ${i} --------------`);
      console.log(
        `Previous line remaining shifts: ${previousLineRemainingTime}`
      );
      console.log(`Line ${i + 1} has ${numberOfShiftsInLine} shifts`);
      console.log(
        `Morning has ${numberOfShiftsMorning}\nAfternoon has ${numberOfShiftsAfternoon}`
      );

      if (previousLineRemainingTime > 0) {
        currentLineMorningShifts.push(
          this.roundToDecimal(shiftLength * previousLineRemainingTime)
        );
        morningShiftCounter = previousLineRemainingTime;
      }

      previousLineRemainingTime = 0;

      // if (numberOfShiftsMorning >= 1)
      morningShiftCounter++;

      while (morningShiftCounter <= numberOfShiftsMorning) {
        currentLineMorningShifts.push(shiftLength);
        morningShiftCounter++;
      }

      morningShiftCounter--;

      if (morningShiftCounter < numberOfShiftsMorning) {
        currentLineMorningShifts.push(
          this.roundToDecimal(
            shiftLength * (numberOfShiftsMorning - morningShiftCounter)
          )
        );
        currentLineAfternoonShifts.push(
          shiftLength -
            this.roundToDecimal(
              shiftLength * (numberOfShiftsMorning - morningShiftCounter)
            )
        );

        afternoonShiftCounter =
          afternoonShiftCounter + (numberOfShiftsMorning - morningShiftCounter);
      }

      // if (numberOfShiftsAfternoon >= 1)
      afternoonShiftCounter++;

      while (afternoonShiftCounter < numberOfShiftsAfternoon) {
        console.log("AFTERNOON SHIFT");
        currentLineAfternoonShifts.push(shiftLength);
        afternoonShiftCounter++;
      }

      afternoonShiftCounter--;

      console.log(afternoonShiftCounter, numberOfShiftsAfternoon);

      if (afternoonShiftCounter <= numberOfShiftsAfternoon) {
        let lastShift = numberOfShiftsAfternoon - afternoonShiftCounter;
        console.log("Last shift: ", lastShift);
        if (
          lastShift > numberOfShiftsAfternoon - 0.1 ||
          lastShift < numberOfShiftsAfternoon + 0.1
        ) {
          currentLineAfternoonShifts.push(
            this.roundToDecimal(shiftLength * numberOfShiftsAfternoon)
          );
        } else {
          currentLineAfternoonShifts.push(
            shiftLength - this.roundToDecimal(shiftLength * lastShift)
          );
        }
        previousLineRemainingTime =
          numberOfShiftsAfternoon - afternoonShiftCounter;
      }

      morningShifts.push(currentLineMorningShifts);
      afternoonShifts.push(currentLineAfternoonShifts);

      console.log("***** SHIFTS *****");
      console.log(currentLineMorningShifts, currentLineAfternoonShifts);
    }

    // ASSIGN DATA

    let collaboratorCounter = 0;
    let shiftMinutesCounter = 0;

    for (let i = 0; i < this.state.nrLines; i++) {
      let morningShiftsDates = [];
      let afternoonShiftsDates = [];
      let startingDate = this.state.morningShiftStart;

      morningShifts[i].forEach((shift) => {
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

      afternoonShifts[i].forEach((shift) => {
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
  };

  computeShifts5 = () => {
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
        name: collaborator,
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
              <Button onClick={this.computeShifts5} variant="contained">
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
