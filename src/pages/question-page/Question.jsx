import React from "react";
import _ from "lodash";
import moment from "moment";
import {
    Container,
    Alert,
    Placeholder,
    Button,
    ButtonGroup,
} from "react-bootstrap";
import Navigation from "../../components/Navbar";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import LoginButton from "../../components/LoginButton";
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

class Question extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired,
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: null,
            contributor: {},
            data: {},
            email: "",
        };
    }

    componentDidMount() {
        fetch("/data/contributors.json")
            .then((resp) => resp.json())
            .then((contributors) => this.setState({ contributors }));

        this.loadData = this.loadData.bind(this);
        this.loginSuccess = this.loginSuccess.bind(this);
        this.logoutSuccess = this.logoutSuccess.bind(this);
        this.updateLoginStatus = this.updateLoginStatus.bind(this);
        this.updateLoginStatus();
        this.loadData();
    }

    loadData() {
        const id = this.props.location.pathname.split("/")[2] || "";
        const token = this.props.cookies.get("tokenId");
        const options = token
            ? {
                  headers: {
                      token,
                  },
              }
            : {};
        // console.log(options, { isLoggedIn: this.state.isLoggedIn, token });
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
                                "Error: Requested question was not found. Please try again with correct ID.",
                        },
                    });
                }
            });
    }

    updateLoginStatus() {
        const tokenId = this.props.cookies.get("tokenId") || "";

        fetch("/login", {
            method: "POST",
            body: new URLSearchParams({ tokenId }).toString(),
        })
            .then((resp) => resp.json())
            .then((data) => {
                const { OK, contributor, email } = data;
                if (OK) {
                    this.loadData();
                    this.setState({
                        isLoggedIn: OK,
                        contributor,
                        email,
                    });
                } else {
                    this.loadData();
                    this.setState({ isLoggedIn: false });
                }
            })
            .catch((err) => {
                setTimeout(() => this.setState({ isLoggedIn: false }), 2000);
            });
    }

    loginSuccess(data) {
        const tokenId = data.tokenId;
        const email = data.profileObj.email;

        const isContributor = this.state.contributors.some(
            (contributor) => contributor.email === email
        );

        // console.log({ isContributor, email });

        if (isContributor) {
            this.props.cookies.set("tokenId", tokenId, { path: "/" });
            this.updateLoginStatus();
        }
    }

    logoutSuccess() {
        this.props.cookies.remove("tokenId", { path: "/" });
        this.updateLoginStatus();
    }

    getContributorName(codeName) {
        const find = this.state.contributors.find(
            (contributor) => contributor.code === codeName
        );
        return find ? find.name : "Anonymous";
    }

    timestampToDate(timestamp) {
        return moment(timestamp).format("lll");
    }

    render() {
        return (
            <>
                <Navigation />
                {this.state.isLoggedIn === true && (
                    <AlertLoginInfo
                        email={this.state.email}
                        onSuccess={this.logoutSuccess}
                    />
                )}
                <Container style={{ padding: "20px" }}>
                    {this.state.isLoggedIn === false && (
                        <Alert variant="info" style={{ marginBottom: "2rem" }}>
                            Login with registered Google Account to access the
                            internal tools.
                            <div className="d-flex justify-content-end">
                                <LoginButton
                                    variant={"outline-info"}
                                    onSuccess={this.loginSuccess}
                                />
                            </div>
                        </Alert>
                    )}
                    {_.isEmpty(this.state.data) ? (
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
                                            <Placeholder
                                                as="p"
                                                animation="glow"
                                            >
                                                <Placeholder xs={12} />
                                            </Placeholder>
                                        </pre>
                                    ) : (
                                        <pre key={idx} style={styles.pre}>
                                            <Placeholder
                                                as="p"
                                                animation="glow"
                                            >
                                                <Placeholder xs={12} />
                                            </Placeholder>
                                        </pre>
                                    )
                                )}
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
                            {!this.state.data.published &&
                                this.state.isLoggedIn &&
                                this.state.contributor.admin && (
                                    <Alert show={true} variant="dark">
                                        <p>
                                            The question is not published yet.
                                            Please use the below buttons to
                                            approve or decline.
                                        </p>
                                        <div className="d-flex justify-content-end">
                                            <ButtonGroup className="mb-2">
                                                <Button variant="success">
                                                    Approve
                                                </Button>
                                                <Button variant="danger">
                                                    Decline
                                                </Button>
                                            </ButtonGroup>
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

export default withCookies(Question);
