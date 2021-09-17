import React from "react";

import {
    Alert,
    Form,
    Modal,
    Button,
    Container,
    InputGroup,
    FormControl,
} from "react-bootstrap";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import Navigation from "../../components/Navbar";
import AlertLogin from "../../components/post-page/AlertLogin";
import AlertLoading from "../../components/post-page/AlertLoading";
import AlertLoginInfo from "../../components/post-page/AlertLoginInfo";

const styles = {
    textarea: {
        resize: "none",
    },
    pre: {
        marginTop: "10px",
        whiteSpace: "pre-wrap",
    },
};

class Post extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            validated: false,
            showModal: false,
            showAlert: false,
            variant: "primary",
            alertText: "",
            isLoggedIn: null,
            data: {},
            email: "",
            contributors: {},
        };
    }

    componentDidMount() {
        fetch("data/contributors.json")
            .then((resp) => resp.json())
            .then((contributors) => this.setState({ contributors }));

        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateData = this.updateData.bind(this);
        this.loginSuccess = this.loginSuccess.bind(this);
        this.logoutSuccess = this.logoutSuccess.bind(this);
        this.updateLoginStatus = this.updateLoginStatus.bind(this);
        this.updateLoginStatus();
    }

    handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget.checkValidity() !== false) {
            this.setState(() => ({ showModal: true }));
        }

        this.setState(() => ({ validated: true }));
    }

    postMCQ() {
        fetch("#", {
            method: "POST",
            body: new URLSearchParams(this.state.data).toString(),
        })
            .then((resp) => resp.json())
            .then((data) => {
                if (data.OK) {
                }
            });
    }

    updateData(e) {
        const currentData = this.state.data;
        currentData[e.target.name] = e.target.value;

        this.setState(() => ({
            data: currentData,
        }));
    }

    updateLoginStatus() {
        const tokenId = this.props.cookies.get("tokenId") || "";

        fetch("/login", {
            method: "POST",
            body: new URLSearchParams({ tokenId }).toString(),
        })
            .then((resp) => resp.json())
            .then((data) => {
                console.log(JSON.stringify(data));
                if (data.OK) {
                    this.setState({
                        isLoggedIn: true,
                        email: data.email,
                    });
                } else {
                    this.setState({ isLoggedIn: false });
                }
            })
            .catch((err) => {
                setTimeout(() => this.setState({ isLoggedIn: false }), 2000);
            });
    }

    loginSuccess(data) {
        console.log("login done");
        const tokenId = data.tokenId;
        const email = data.profileObj.email;

        const isContributor = this.state.contributors.some(
            (contributor) => contributor.email === email
        );

        console.log({ isContributor, email });

        if (isContributor) {
            this.props.cookies.set("tokenId", tokenId, { path: "/" });
            this.updateLoginStatus();
        }
    }

    logoutSuccess() {
        this.props.cookies.remove("tokenId", { path: "/" });
        this.updateLoginStatus();
    }

    render() {
        return this.state.isLoggedIn == null ? (
            <AlertLoading />
        ) : !this.state.isLoggedIn ? (
            <AlertLogin onSuccess={this.loginSuccess} />
        ) : (
            <>
                <Navigation />
                <AlertLoginInfo
                    onSuccess={this.logoutSuccess}
                    email={this.state.email}
                />
                <Container style={{ padding: "20px" }}>
                    <Alert
                        show={this.state.showAlert}
                        variant={this.state.variant}
                        className="rounded-0"
                    >
                        {this.state.alertText}
                    </Alert>
                    <Form
                        noValidate
                        validated={this.state.validated}
                        onSubmit={this.handleSubmit}
                    >
                        <Form.Group className="mb-3">
                            <Form.Label>Question</Form.Label>
                            <Form.Control
                                name="question"
                                as="textarea"
                                style={styles.textarea}
                                placeholder="What's your question?"
                                onChange={this.updateData}
                                rows={3}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid question.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Formatted Code (if any)</Form.Label>
                            <Form.Control
                                name="code"
                                as="textarea"
                                style={styles.textarea}
                                placeholder="Enter formatted Code"
                                onChange={this.updateData}
                                rows={3}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Explaination</Form.Label>
                            <Form.Control
                                name="explaination"
                                as="textarea"
                                style={styles.textarea}
                                placeholder="Explaination"
                                onChange={this.updateData}
                                rows={3}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Options</Form.Label>
                            <InputGroup className="mb-3">
                                <InputGroup.Radio
                                    value="option_1"
                                    name="correct_option"
                                    onChange={this.updateData}
                                    required
                                />
                                <FormControl
                                    name="option_1_value"
                                    placeholder="Option 1"
                                    onChange={this.updateData}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid solution.
                                </Form.Control.Feedback>
                            </InputGroup>
                            <InputGroup className="mb-3">
                                <InputGroup.Radio
                                    value="option_2"
                                    name="correct_option"
                                    onChange={this.updateData}
                                    required
                                />
                                <FormControl
                                    name="option_2_value"
                                    placeholder="Option 2"
                                    onChange={this.updateData}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid solution.
                                </Form.Control.Feedback>
                            </InputGroup>
                            <InputGroup className="mb-3">
                                <InputGroup.Radio
                                    value="option_3"
                                    name="correct_option"
                                    onChange={this.updateData}
                                    required
                                />
                                <FormControl
                                    name="option_3_value"
                                    placeholder="Option 3"
                                    onChange={this.updateData}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid solution.
                                </Form.Control.Feedback>
                            </InputGroup>
                            <InputGroup className="mb-3">
                                <InputGroup.Radio
                                    value="option_4"
                                    name="correct_option"
                                    onChange={this.updateData}
                                    required
                                />
                                <FormControl
                                    name="option_4_value"
                                    placeholder="Option 4"
                                    onChange={this.updateData}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid solution.
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        <Button type="submit" variant="primary">
                            Post Question
                        </Button>
                    </Form>
                    <Modal
                        show={this.state.showModal}
                        fullscreen={true}
                        onHide={() => this.setState({ showModal: false })}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Are you Sure?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Alert variant={"danger"}>
                                <b>Remember:</b> Once the question is submitted
                                it cannot be modified. So, Please verify the
                                question once again before confirming. Once
                                verified, Press the "Understood" button.
                            </Alert>
                            <>
                                <b>Question:</b>
                                <pre style={styles.pre}>
                                    {this.state.data.question}
                                </pre>
                            </>
                            {this.state.data.code && (
                                <>
                                    <b>Code:</b>
                                    <pre style={styles.pre}>
                                        {this.state.data.code}
                                    </pre>
                                </>
                            )}
                            {this.state.data.explaination && (
                                <>
                                    <b>Explaination:</b>
                                    <pre style={styles.pre}>
                                        {this.state.data.explaination}
                                    </pre>
                                </>
                            )}
                            <>
                                <b>Options:</b>
                                {[
                                    "option_1_value",
                                    "option_2_value",
                                    "option_3_value",
                                    "option_4_value",
                                ].map((option, idx) => (
                                    <pre
                                        key={idx}
                                        style={
                                            !option.includes(
                                                this.state.data.correct_option
                                            )
                                                ? styles.pre
                                                : {
                                                      color: "green",
                                                      ...styles.pre,
                                                  }
                                        }
                                    >
                                        <b>
                                            {option.split("_")[1]} {">"}
                                        </b>{" "}
                                        {this.state.data[option]}{" "}
                                        {option.includes(
                                            this.state.data.correct_option
                                        ) && <b>{"(correct)"}</b>}
                                    </pre>
                                ))}
                            </>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    this.setState({ showModal: false })
                                }
                            >
                                Close
                            </Button>
                            <Button variant="primary" onClick={this.postMCQ}>
                                Understood
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </>
        );
    }
}

export default withCookies(Post);
