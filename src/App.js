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
      shadePreviousCells: true,
      shadePreviousAppointments: true,
      updateInterval: 10000,
    };
  }

  render() {
    const {
      data,
      shadePreviousCells,
      updateInterval,
      shadePreviousAppointments,
    } = this.state;

    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            IAS Phone scheduler
          </Typography>
          <Paper>
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
          <Copyright />
        </Box>
      </Container>
    );
  }
}
