import * as React from "react";
import "./PhoneScheduler.css";

// Material UI
import { styled, alpha } from "@mui/material/styles";
import classNames from "clsx";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Modal,
  TextField,
} from "@mui/material";

// WYSIWYG Editor
import { Editor } from "react-draft-wysiwyg";
import {
  EditorState,
  convertToRaw,
  convertFromHTML,
  ContentState,
} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";

// React Scheduler
import {
  Scheduler,
  DayView,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  CurrentTimeIndicator,
} from "@devexpress/dx-react-scheduler-material-ui";
import {
  DragDropProvider,
  EditingState,
  IntegratedEditing,
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
  classes,
} from "./utility/constants";

// UTILS
import { getMinuteDifference } from "./utility/utils";

// COMPONENTS
import Settings from "./Settings";
import { Copyright } from "./Copyright";
import { supabase } from "./database/client";
import MailTo from "./email/MailTo";
import { useState } from "react";
import { useEffect } from "react";
// import { useAuth } from "./auth/Auth";
import { useNavigate } from "react-router-dom";
import htmlToDraft from "html-to-draftjs";

const currentDate = new Date();

// ************** STYLED COMPONENTS **************/

const StyledDiv = styled("div", {
  shouldForwardProp: (prop) => prop !== "top",
})(({ theme, top }) => ({
  [`& .${classes.line}`]: {
    height: "2px",
    borderTop: `2px black solid`,
    width: "100%",
    transform: "translate(0, -1px)",
  },
  [`& .${classes.circle}`]: {
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    background: "black",
  },
  [`& .${classes.nowIndicator}`]: {
    position: "absolute",
    zIndex: 1,
    left: 0,
    top,
  },
}));

// ************** SCHEDULER UTILITIES ***************

// ************** CUSTOM COMPONENTS **************

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
    onClick={(e) => console.log("clicked", data)}
  >
    {children}
  </Appointments.Appointment>
);

// Time indicator
const TimeIndicator = ({ top, ...restProps }) => (
  <StyledDiv top={top} {...restProps}>
    <div className={classNames(classes.nowIndicator, classes.circle)} />
    <div className={classNames(classes.nowIndicator, classes.line)} />
  </StyledDiv>
);

// Text editor
const TextEditor = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
};

// Custom overlay
const FormOverlay = React.forwardRef(({ visible = false, children }) => {
  return (
    <Modal open={visible}>
      <Paper className={classes.root}>{children}</Paper>
    </Modal>
  );
});

// Custom form
const CustomAppointmentForm = ({
  onFieldChange,
  appointmentData,
  ...restProps
}) => {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");

  const onEmailChange = (nextValue) => {
    console.log("next: ", nextValue);
    onFieldChange({ email: nextValue });
  };

  return (
    <AppointmentForm.BasicLayout
      className="scheduler-form"
      style={{ width: "100%" }}
      appointmentData={appointmentData}
      onFieldChange={onFieldChange}
      {...restProps}
    >
      <AppointmentForm.Label text="Email" type="title" />
      <AppointmentForm.TextEditor
        value={appointmentData.email}
        onValueChange={onEmailChange}
        placeholder="Email"
      />
    </AppointmentForm.BasicLayout>
  );
};

export default function PhoneScheduler() {
  // const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    // Ends user session
    await signOut();

    // Redirects the user to Login page
    navigate("/login");
  }

  const today = new Date();
  const [morningShiftStart, setMorningShiftStart] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      MORNING_SHIFT_START[0],
      MORNING_SHIFT_START[1],
      0
    )
  );
  const [morningShiftEnd, setMorningShiftEnd] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      MORNING_SHIFT_END[0],
      MORNING_SHIFT_END[1],
      0
    )
  );
  const [afternoonShiftStart, setAfternoonShiftStart] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      AFTERNOON_SHIFT_START[0],
      AFTERNOON_SHIFT_START[1],
      0
    )
  );
  const [afternoonShiftEnd, setAfternoonShiftEnd] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      AFTERNOON_SHIFT_END[0],
      AFTERNOON_SHIFT_END[1],
      0
    )
  );

  const locale = "it-IT";
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [nrLines, setNrLines] = useState(2);
  const [collaborators, setCollaborators] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [shadePreviousCells, setSharePreviousCells] = useState(true);
  const [shadePreviousAppointments, setShadePreviousAppointments] =
    useState(true);
  const [updateInterval, setUpdateInterval] = useState(1000);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [fromList, setFromList] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      let { data, error } = await supabase.from("collaborators").select();
      if (!error) {
        setCollaborators(data);
      }
    };

    fetchData();
  }, []);

  const handleNrLinesChange = (event) => {
    const {
      target: { value },
    } = event;

    setNrLines(value);
  };

  const handleLineDurationChange = (event) => {
    const {
      target: { value },
    } = event;

    setLineDuration(value);
  };

  const handleCollaboratorsChange = (event) => {
    console.log(event);
    const {
      target: { value },
    } = event;
    setSelectedCollaborators(
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleFromListChange = (event) => {
    const {
      target: { value },
    } = event;

    setFromList(value);
  };

  const roundToDecimal = (value) => {
    return Math.round(value);
  };

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
  };

  const prepareEmailBody = () => {
    if (!appointmentsData || appointmentsData.length === 0) {
      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromText(
            "Nessun turno assegnato. Per generare un e-mail assegnare prima i turni."
          )
        )
      );
    } else {
      let lineStrings = appointmentsData.map((line, index1) => {
        let shifts = line.map((shift, index2) => {
          return (
            "<li>" +
            shift.startDate.getHours() +
            ":" +
            (shift.startDate.getMinutes() < 10 ? "0" : "") +
            shift.startDate.getMinutes() +
            " - " +
            shift.endDate.getHours() +
            ":" +
            (shift.endDate.getMinutes() < 10 ? "0" : "") +
            shift.endDate.getMinutes() +
            " / " +
            shift.title +
            "</li>"
          );
        });

        shifts = shifts.join("");
        return "<p><strong>Linea " + index1 + "</strong></p>" + shifts;
      });
      lineStrings = lineStrings.join("");

      let emailBody =
        "<div>" +
        "<p>Ciao a tutti,</p>" +
        "<p>Di seguito trovate i turni odierni " +
        new Date().toLocaleDateString("ch-IT") +
        ":</p>" +
        lineStrings +
        "<p>Buona giornata!</p>" +
        "</div>";

      console.log(emailBody);

      const blocks = convertFromHTML(emailBody);

      setFromList(
        selectedCollaborators
          .map((collaborators) => {
            return collaborators.email;
          })
          .join(";")
      );
      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromBlockArray(
            blocks.contentBlocks,
            blocks.entityMap
          )
        )
      );
    }
  };

  const htmlToDraftBlocks = (html) => {
    const blocksFromHtml = htmlToDraft(html);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(
      contentBlocks,
      entityMap
    );
    const editorState = EditorState.createWithContent(contentState);
    return editorState;
  };

  const computeShifts = () => {
    if (!selectedCollaborators || selectedCollaborators.length === 0) return;

    setAppointmentsData([]);
    const morningLineDuration = getMinuteDifference(
      morningShiftStart,
      morningShiftEnd
    );

    const afternoonLineDuration = getMinuteDifference(
      afternoonShiftStart,
      afternoonShiftEnd
    );

    const lineDuration = morningLineDuration + afternoonLineDuration;
    let shiftLength = (lineDuration * nrLines) / selectedCollaborators.length;
    console.log(lineDuration, nrLines, selectedCollaborators);

    if (!Number.isInteger(shiftLength)) {
      shiftLength = Math.trunc(shiftLength);
    }

    console.log(
      `Total line duration: ${lineDuration}, shift length: ${shiftLength}`
    );

    let shuffledCollaborators = selectedCollaborators.sort(
      () => Math.random() - 0.5
    );
    console.log("THESE WERE SELECTED: ", selectedCollaborators);

    let previousLineRemaining = 0;
    let lineShifts = [];
    for (let i = 0; i < nrLines; i++) {
      let result = consumeLine(
        shiftLength,
        previousLineRemaining,
        i === nrLines - 1
      );
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

    console.log(splittedLineShifts, computedShifts);

    // ASSIGN DATA

    let shiftId = 0;
    let collaboratorCounter = 0;
    let shiftMinutesCounter = 0;
    let currentCollaborator = null;
    let assignedShifts = [];

    for (let i = 0; i < nrLines; i++) {
      let morningShiftsDates = [];
      let afternoonShiftsDates = [];
      let startingDate = morningShiftStart;
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
          id: shiftId,
          title: `${currentCollaborator.name} ${currentCollaborator.surname}`,
          email: currentCollaborator.email,
          color: currentCollaborator.color,
          startDate: startingDate,
          endDate: new Date(startingDate.getTime() + shift * 60000),
        });

        shiftId++;
        startingDate = new Date(startingDate.getTime() + shift * 60000);
      });

      startingDate = afternoonShiftStart;

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
          id: shiftId,
          title: `${currentCollaborator.name} ${currentCollaborator.surname}`,
          email: currentCollaborator.email,
          color: currentCollaborator.color,
          startDate: startingDate,
          endDate: new Date(startingDate.getTime() + shift * 60000),
        });

        shiftId++;
        startingDate = new Date(startingDate.getTime() + shift * 60000);
      });

      assignedShifts = [
        ...assignedShifts,
        [...morningShiftsDates, ...afternoonShiftsDates],
      ];
    }

    setAppointmentsData(assignedShifts);
    console.log(assignedShifts);
    console.log(splittedLineShifts, computedShifts);
  };

  const consumeLine = (
    shiftLength = 0,
    previousLineRemaining = 0,
    isLast = false
  ) => {
    const morningLineDuration = getMinuteDifference(
      morningShiftStart,
      morningShiftEnd
    );

    const afternoonLineDuration = getMinuteDifference(
      afternoonShiftStart,
      afternoonShiftEnd
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
      if (isLast) {
        let lastAdded = shifts.pop();
        shifts.push(lastAdded + (afternoonEndMinute - currentMinutePosition));

        return {
          shifts,
          remaining: 0,
        };
      }
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

  const getD = (d) => {
    d = new Date(d);
    return `${d.getHours()}:${d.getMinutes()}`;
  };

  const settingsValid = () => {
    if (isNaN(lineDuration) || collaborators.length < 1) {
      return false;
    }

    return true;
  };

  const commitChanges = ({ added, changed, deleted }) => {
    console.log("COMMITTING CHANGES...", added, changed, deleted);
    console.log("Appointments Data", appointmentsData);
    const newAppointmentsData = [];

    appointmentsData.forEach((lineAppointmentsData) => {
      let updatedData = lineAppointmentsData;
      if (added) {
        const startingAddedId =
          updatedData.length > 0
            ? updatedData[updatedData.length - 1].id + 1
            : 0;
        updatedData = [...updatedData, { id: startingAddedId, ...added }];
      }
      if (changed) {
        updatedData = updatedData.map((appointment) =>
          changed[appointment.id]
            ? { ...appointment, ...changed[appointment.id] }
            : appointment
        );
      }
      if (deleted !== undefined) {
        updatedData = updatedData.filter(
          (appointment) => appointment.id !== deleted
        );
      }

      newAppointmentsData.push(updatedData);
    });

    setAppointmentsData(newAppointmentsData);
  };

  return (
    <Container maxWidth="100%" margin={4}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Settings
            nrLines={nrLines}
            handleNrLinesChange={handleNrLinesChange}
            selectedCollaborators={selectedCollaborators}
            collaborators={collaborators}
            handleCollaboratorsChange={handleCollaboratorsChange}
            // lineDuration={lineDuration}
            handleLineDurationChange={handleLineDurationChange}
            submit={computeShifts}
          />
          {/* <MailTo data={appointmentsData} /> */}
        </Grid>
        <Grid item xs={12} md={7}>
          <Box
            p="10px"
            style={{
              border: "1px solid rgba(0, 0, 0, 0.23)",
              borderRadius: "20px",
            }}
          >
            <Grid container direction="column" spacing={2}>
              <Grid item style={{ maxWidth: "100%" }}>
                <TextField
                  style={{ width: "350px", maxWidth: "100%" }}
                  id="outlined-read-only-input"
                  label="Destinatari"
                  value={fromList}
                  onChange={handleFromListChange}
                />
              </Grid>
              <Grid item style={{ maxWidth: "100%" }}>
                <Editor
                  editorState={editorState}
                  toolbarClassName="toolbarClassName"
                  wrapperClassName="wrapperClassName"
                  editorClassName="editorClassName"
                  onEditorStateChange={onEditorStateChange}
                />
              </Grid>
              <Grid item textAlign="center" style={{ maxWidth: "100%" }}>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={prepareEmailBody}
                >
                  Genera e-mail
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ marginTop: "40px" }} />
      <Grid my={4}>
        <Typography variant="h4" fontWeight={600} component="h1" gutterBottom>
          Turni
        </Typography>
      </Grid>
      <Grid m={1} w={"100%"} justifyContent="center" alignItems="center">
        <Grid container spacing={3}>
          {[...Array(nrLines)].map((e, i) => {
            return (
              <Grid item xs={12} md={4} key={i} style={{ overflow: "visible" }}>
                <Paper style={{ overflow: "visible" }}>
                  <Typography
                    variant="h5"
                    padding="10px 0 10px 10px"
                    fontWeight={600}
                    component="h1"
                    gutterBottom
                  >
                    Linea {i + 1}
                  </Typography>
                  <Scheduler
                    className="scheduler"
                    locale={locale}
                    data={appointmentsData[i]}
                  >
                    <ViewState currentDate={currentDate} />
                    <EditingState onCommitChanges={commitChanges} />
                    <IntegratedEditing />
                    <DayView startDayHour={8} endDayHour={16.5} />
                    <Appointments appointmentComponent={Appointment} />
                    {/* <DragDropProvider /> */}
                    <AppointmentTooltip showCloseButton showOpenButton />
                    <AppointmentForm
                      basicLayoutComponent={CustomAppointmentForm}
                      textEditorComponent={TextEditor}
                      overlayComponent={FormOverlay}
                    />
                    <CurrentTimeIndicator
                      indicatorComponent={TimeIndicator}
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
