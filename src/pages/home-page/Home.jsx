import React from "react";
import _ from "lodash";

import {
  Alert,
  Container,
  Table,
  ListGroup,
  Placeholder,
} from "react-bootstrap";

import Navigation from "../../components/Navbar";

const slots = ["S1", "S2", "S3"];
const days = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timetable: {},
      contributors: [],
      topics: [],
    };
  }

  init() {
    fetch("data/timetable.json")
      .then((resp) => resp.json())
      .then((timetable) => this.setState({ timetable }));
    fetch("data/contributors.json")
      .then((resp) => resp.json())
      .then((contributors) => this.setState({ contributors }));
    fetch("data/topics.json")
      .then((resp) => resp.json())
      .then((topics) => this.setState({ topics }));
  }

  componentDidMount() {
    this.init(this.props);
  }

  getTopicName(codeName) {
    var find = this.state.topics.find((topic) => topic.code === codeName);
    return find ? find.name : "";
  }

  render() {
    return _.isEmpty(this.state.timetable) ||
      _.isEmpty(this.state.contributors) ||
      _.isEmpty(this.state.topics) ? (
      <div>
        <Navigation />
        <Container fluid style={{ padding: "20px" }}>
          <Alert variant="success" style={{ marginBottom: "2rem" }}>
            <Alert.Heading>Hey, nice to see you</Alert.Heading>
            <p>
              <Placeholder as="p" animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            </p>
            <hr />
            <p className="mb-0">
              <Placeholder as="p" animation="glow">
                <Placeholder xs={6} />
              </Placeholder>
            </p>
          </Alert>
        </Container>
      </div>
    ) : (
      <>
        <Navigation />
        <Container fluid style={{ padding: "20px" }}>
          <Alert variant="success" style={{ marginBottom: "2rem" }}>
            <Alert.Heading>Hey, nice to see you</Alert.Heading>
            <p>
              Here is the MCQ schedule to be followed from AUG 30 2021 to SEPT
              12 2021.
            </p>
            <hr />
            <p className="mb-0">
              Moderator of the week is <b>Suman More</b>
            </p>
          </Alert>
          <h2>Timetable</h2>
          <Table
            responsive
            striped
            bordered
            hover
            style={{ marginBottom: "2rem" }}
          >
            <thead>
              <tr>
                <th>DAY</th>
                <th>SLOT 1</th>
                <th>SLOT 2</th>
                <th>SLOT 3</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(days).map((day) => {
                return (
                  <tr key={day}>
                    <td>{days[day]}</td>
                    {slots.map((slot) => {
                      const topic = this.state.timetable[day][slot]["topic"];
                      const assignee =
                        this.state.timetable[day][slot]["assignee"];
                      return (
                        <td key={slot + day}>
                          {topic ? this.getTopicName(topic) : ""} ({assignee})
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <h2>Topics</h2>
          <ListGroup style={{ marginBottom: "2rem" }}>
            {this.state.topics.map((topic) => (
              <ListGroup.Item key={topic.code}>{topic.name}</ListGroup.Item>
            ))}
          </ListGroup>
          <h2>Contributors</h2>
          <ListGroup style={{ marginBottom: "2rem" }}>
            {this.state.contributors.map((contributor) => (
              <ListGroup.Item key={contributor.code}>
                {contributor.name} ({contributor.code})
              </ListGroup.Item>
            ))}
          </ListGroup>
          <h2>Slots</h2>
          <ListGroup style={{ marginBottom: "2rem" }}>
            <ListGroup.Item key="S1">SLOT 1 (6AM - 11AM)</ListGroup.Item>
            <ListGroup.Item key="S2">SLOT 2 (12PM - 5PM)</ListGroup.Item>
            <ListGroup.Item key="S3">SLOT 3 (6PM - 11PM)</ListGroup.Item>
          </ListGroup>
        </Container>
      </>
    );
  }
}

export default Home;
