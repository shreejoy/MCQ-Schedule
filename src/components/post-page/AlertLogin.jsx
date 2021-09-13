import React from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "react-google-login";
import { Container, Alert, Spinner, Button } from "react-bootstrap";

class AlertLogin extends React.Component {
  render() {
    const { onSuccess } = this.props;
    return (
      <Container fluid style={{ padding: "20px" }}>
        <Alert variant="danger">
          <Alert.Heading>Authorization Error</Alert.Heading>
          <p>Login with your registered Google Account to access this page.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <GoogleLogin
              clientId="310703059955-ocms672ir8c4emu5gar5v5f5je4srifh.apps.googleusercontent.com"
              render={(renderProps) => (
                <Button
                  variant="outline-danger"
                  style={{ marginRight: "10px" }}
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >
                  {renderProps.disabled ? (
                    <Spinner
                      as="span"
                      animation="grow"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    "Login"
                  )}
                </Button>
              )}
              prompt={"select_account"}
              onSuccess={onSuccess}
              cookiePolicy={"single_host_origin"}
            />
            <Button as={Link} variant="outline-secondary" to="/">
              Close
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }
}

export default AlertLogin;
