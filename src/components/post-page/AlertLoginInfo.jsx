import React from "react";
import { GoogleLogout } from "react-google-login";
import { Alert } from "react-bootstrap";

class AlertLoginInfo extends React.Component {
  render() {
    const { email, onSuccess } = this.props;
    return (
        <Alert variant="info" className="rounded-0">
        You are logged in as <b>{email}</b>
        {" ("}
        <GoogleLogout
          clientId="310703059955-ocms672ir8c4emu5gar5v5f5je4srifh.apps.googleusercontent.com"
          render={(renderProps) => (
            <span
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={renderProps.onClick}
            >
              logout
            </span>
          )}
          onLogoutSuccess={onSuccess}
          cookiePolicy={"single_host_origin"}
        />
        {")"}
      </Alert>
    );
  }
}

export default AlertLoginInfo;
