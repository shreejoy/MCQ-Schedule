import React from "react";
import { Container, Form, Button } from "react-bootstrap";
import Navigation from "../../components/Navbar";
import GoogleLogin from "react-google-login";

class Login extends React.Component {
  responseGoogle(a) {
    console.log(a);
  }
  render() {
    return (
      <>
        <Navigation />
        <Container style={{ padding: "20px" }}>
          <GoogleLogin
            clientId="310703059955-ocms672ir8c4emu5gar5v5f5je4srifh.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={this.responseGoogle}
            onFailure={this.responseGoogle}
            cookiePolicy={"single_host_origin"}
          />
          <div className="d-flex align-items-center justify-content-center">
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" />
              </Form.Group>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </div>
        </Container>
      </>
    );
  }
}

export default Login;
