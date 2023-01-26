import { Button } from "@mui/material";
import React, { Component } from "react";
import { EMAIL_FOOTER, EMAIL_HEADER } from "../utility/constants";

export default class MailTo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mailto: "",
    };
  }

  generateEmail = () => {
    if (!this.props.data) return;

    const date = new Date();
    console.log(date);
    let receivers = "ivan96jp@gmail.com,alengavra19@gmail.com";
    let subject = `Turni telefono - ${date.toLocaleDateString("ch-IT")}`;
    let body =
      "<p><p>Ciao a tutti,</p><p>di seguito trovate i turni del telefono odierni:<ul><li>Alen Gavranovic:<ul><li>08:30 - 11:30</li><li>14:00 - 16:00</li></ul></li><li>Ivan Pavic:<ul><li>08:30 - 10:30</li><li>10:30 - 11:30</li></ul></li></ul></p></p>";

    const formData = new FormData();
    formData.append("access_token", "test_value");
    formData.append("email_from", "ivan96jp@gmail.com");
    formData.append("email_to", receivers);
    formData.append("email_subject", subject);
    formData.append("email_body", EMAIL_HEADER + body + EMAIL_FOOTER);

    const data = new URLSearchParams(formData);

    fetch("/sendmail", {
      method: "POST",
      body: data,
    }).then((response) => console.log(response));

    // this.setState({
    //   mailto: `mailto:${receivers}?subject=${encodeURIComponent(
    //     subject
    //   )}&body=${encodeURIComponent(body)}`,
    // });
  };

  render() {
    return (
      <div>
        <Button
          color="primary"
          disabled={this.props.data.length > 0 ? false : true}
          onClick={this.generateEmail}
          href={this.state.mailto}
        >
          Genera e-mail
        </Button>
      </div>
    );
  }
}
/*
mailto:ivan96jp@gmail.com,alengavra19@gmail.com?cc=pincopallino@gmail.com&subject=Turni%20telefono%20-%2023.02.2023&body=Cari%20collaboratori%2C%0D%0A%0D%0ADi%20seguito%20trovate%20i%20turni%20del%20telefono%20odierni%3A%0D%0AAlen%20Gavranovic%3A%0D%0A-%20Linea%201%3A%2008%3A30%20-%2011%3A30%0D%0A-%20Linea%201%3A%2014%3A00%20-%2016%3A00%0D%0A-%20Linea%202%3A%2008%3A30%20-%2010%3A45 
*/
