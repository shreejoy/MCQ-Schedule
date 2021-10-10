import React from "react";
import _ from "lodash";
import moment from "moment";
import { Container, Alert, Placeholder, Button, Modal } from "react-bootstrap";
import Navigation from "../../components/Navbar";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import AlertLoginInfo from "../../components/post-page/AlertLoginInfo";
import { connect } from "react-redux";

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

class Question extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired,
    };
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            showModal: false,
        };
    }

    componentDidMount() {
        this.loadData = this.loadData.bind(this);
        this.loadData();
    }


    loadData() {
        const id = this.props.match.params.id;
        const options = _.set(
            {},
            "headers.token",
            this.props.cookies.get("tokenId")
        );
        fetch(`/MCQ/question?id=${id}`, options)
            .then((resp) => resp.json())
            .then((data) => {
                const { OK, response } = data;
                if (OK) this.setState({ data: response });
                else {
                    this.props.history.push({
                        pathname: "/questions",
                        state: {
                            showAlert: true,
                            variant: "danger",
                            alertText:
                                "Error: Requested question was not found. Please try again with correct question ID.",
                        },
                    });
                }
            });
    }

    review(action) {
        //const id = this.props.match.params.id;
    }

    getContributorName(codeName) {
        const find = this.props.state.contributors.find(
            (contributor) => contributor.code === codeName
        );
        return find ? find.name : "Anonymous";
    }

    timestampToDate(timestamp) {
        return moment(timestamp).format("lll");
    }

    reload() {
        this.forceUpdate();
    }

    render() {
        return (
            <>
                <Navigation />
                <AlertLoginInfo post={this.loadData} />
                <Container style={{ padding: "20px" }}>
                    {_.isEmpty(this.state.data) ||
                    !this.props.state.contributors ? (
                        <>
                            <>
                                <b>Question:</b>
                                <pre style={styles.pre}>
                                    <Placeholder as="p" animation="glow">
                                        <Placeholder xs={12} />
                                    </Placeholder>
                                </pre>
                            </>
                            <>
                                <b>Options:</b>
                                {_.times(4, (id) => (
                                    <pre key={id} style={styles.pre}>
                                        <Placeholder as="p" animation="glow">
                                            <Placeholder xs={12} />
                                        </Placeholder>
                                    </pre>
                                ))}
                            </>
                        </>
                    ) : (
                        <>
                            <>
                                <b>Author:</b>
                                <pre style={styles.pre}>
                                    {this.getContributorName(
                                        this.state.data.author
                                    )}
                                </pre>
                            </>
                            <>
                                <b>Date {"&"} TIme:</b>
                                <pre style={styles.pre}>
                                    {this.timestampToDate(
                                        this.state.data.timestamp
                                    )}
                                </pre>
                            </>
                            <>
                                <b>Question:</b>
                                <pre style={styles.pre}>
                                    {this.state.data.question}
                                </pre>
                            </>
                            {this.state.data.code && (
                                <>
                                    <b>Code:</b>
                                    <pre style={{...styles.pre, whiteSpace: "no-wrap"}}>
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
                                ].map((option, idx) =>
                                    option.includes(
                                        this.state.data.correct_option
                                    ) ? (
                                        <pre
                                            key={idx}
                                            style={{
                                                color: "green",
                                                ...styles.pre,
                                            }}
                                        >
                                            {idx + 1} {" > "}{" "}
                                            {this.state.data[option]}{" "}
                                            <b>{"(correct)"}</b>
                                        </pre>
                                    ) : (
                                        <pre key={idx} style={styles.pre}>
                                            {idx + 1} {" > "}{" "}
                                            {this.state.data[option]}
                                        </pre>
                                    )
                                )}
                            </>
                            <Modal
                                show={this.state.showModal}
                                backdrop="static"
                                onHide={() =>
                                    this.setState({ showModal: false })
                                }
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title>Are you Sure?</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Alert variant={"danger"}>
                                        <b>Remember:</b> This is a permanent
                                        irreversible action. Once DECLINED, you
                                        will not be able to recover this
                                        question. And once APPROVED, you will
                                        not be able to edit this question.
                                    </Alert>
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
                                        Understood
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                            {!this.state.data.published &&
                                this.props.state.auth &&
                                this.props.state.user.admin && (
                                    <Alert show={true} variant="warning">
                                        <p>
                                            The question is not published yet.
                                            Please use the below buttons to
                                            approve or decline.
                                        </p>
                                        <div>
                                            <Button
                                                variant="success"
                                                onClick={() =>
                                                    this.setState(() => ({
                                                        showModal: true,
                                                    }))
                                                }
                                            >
                                                Approve
                                            </Button>{" "}
                                            <Button variant="danger">
                                                Decline
                                            </Button>
                                        </div>
                                    </Alert>
                                )}
                        </>
                    )}
                </Container>
            </>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withCookies(Question));
