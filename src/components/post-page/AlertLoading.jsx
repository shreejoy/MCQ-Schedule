import React from "react";
import { Container, Alert, Placeholder } from "react-bootstrap";

class AlertLoading extends React.Component {
  render() {
    return (
      <Container fluid style={{ padding: "20px" }}>
        <Alert variant="danger">
          <Alert.Heading>
            <Placeholder as="p" animation="glow">
              <Placeholder xs={4} />
            </Placeholder>
          </Alert.Heading>
          <Placeholder as="p" animation="glow">
            <Placeholder xs={12} />
          </Placeholder>
        </Alert>
      </Container>
    );
  }
}

export default AlertLoading;
