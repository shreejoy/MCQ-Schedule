import React from "react";

import {
    Alert,
    Form,
    Modal,
    Button,
    Container,
    InputGroup,
    FormControl,
    Spinner,
} from "react-bootstrap";
import { connect } from "react-redux";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import Navigation from "../../components/Navbar";
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

const mapStateToProps = (state) => {
    return { state };
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: (action) => {
            dispatch(action);
        },
    };
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
            confirmed: false,
            data: {},
        };
    }

    componentDidMount() {
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateData = this.updateData.bind(this);
        this.postMCQ = this.postMCQ.bind(this);
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
        this.setState({
            confirmed: true,
        });
        const token = this.props.cookies.get("tokenId");
        fetch("/MCQ/create", {
            method: "POST",
            headers: {
                token,
            },
            body: new URLSearchParams(this.state.data).toString(),
        })
            .then((resp) => resp.json())
            .then((data) => {
                if (data.OK) {
                    this.setState({
                        confirmed: false,
                        showModal: false,
                        showAlert: true,
                        variantAlert: "success",
                        textAlert:
                            "Question is submitted successfully and is ready for review. Redirecting to preview in 5secs...",
                    });
                    setTimeout(() => {
                        this.props.history.push(`/question/${data.docId}`);
                    }, 5000);
                } else {
                    this.setState({
                        confirmed: false,
                        showModal: false,
                        showAlert: true,
                        variantAlert: "danger",
                        textAlert: `Question is submission failed with Error: ${data.error}`,
                    });
                }
            }).catch((err) => {
                console.log(err.json())
                this.setState({
                    confirmed: false,
                    showModal: false,
                    showAlert: true,
                    variantAlert: "danger",
                    textAlert: `Question is submission failed with Error: ${err.message}`,
                });
            })
    }

    updateData(e) {
        this.setState(() => ({
            data: { ...this.state.data, [e.target.name]: e.target.value },
        }));
    }

    render() {
        return (
            <>
                <Navigation />
                <AlertLoginInfo />
                {this.props.state.auth && (
                    <Container style={{ padding: "20px" }}>
                        <Alert
                            show={this.state.showAlert}
                            variant={this.state.variantAlert}
                            className="rounded-0"
                        >
                            {this.state.textAlert}
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
                            {this.state.data.code && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Code Language</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="language"
                                        defaultValue="."
                                        onChange={this.updateData}
                                        isValid={Boolean(
                                            this.state.data.language
                                        )}
                                        required={Boolean(this.state.data.code)}
                                    >
                                        <option></option>
                                        {[
                                            "c",
                                            "css",
                                            "cpp",
                                            "go",
                                            "html",
                                            "java",
                                            "javascript",
                                            "jsx",
                                            "php",
                                            "python",
                                            "rust",
                                            "typescript",
                                        ].map((language, idx) => (
                                            <option key={idx}>
                                                {language}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a correct langauge for
                                        above code.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            )}

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
                                    <b>Remember:</b> Once the question is
                                    submitted it cannot be modified. So, Please
                                    verify the question once again before
                                    confirming. Once verified, Press the
                                    "Understood" button.
                                </Alert>
                                <>
                                    <b>Question:</b>
                                    <pre style={styles.pre}>
                                        {this.state.data.question}
                                    </pre>
                                </>
                                {this.state.data.code && (
                                    <>
                                        <b>
                                            Code: (Language:{" "}
                                            {this.state.data.language})
                                        </b>
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
                                                    this.state.data
                                                        .correct_option
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
                                <Button
                                    variant="primary"
                                    onClick={this.postMCQ}
                                >
                                    {this.state.confirmed ? (
                                        <Spinner
                                            as="span"
                                            animation="grow"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        "Understood"
                                    )}
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Container>
                )}
            </>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Post));
