import React from "react";
import _ from "lodash";
import moment from "moment";
import { Container, Alert, Button, Card, Spinner } from "react-bootstrap";
import Navigation from "../../components/Navbar";

import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import { GoogleLogin } from "react-google-login";

import { Link } from "react-router-dom";
import styled from "styled-components";
import AlertLoginInfo from "../../components/post-page/AlertLoginInfo";
import CardPlaceholder from "../../components/questions-page/CardPlaceholder";

const CustomCard = styled(Card)`
    margin-bottom: 1rem;
    :hover {
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12),
            0 4px 8px rgba(0, 0, 0, 0.06);
    }
`;

const Text = styled(Card.Text)`
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
`;

class Questions extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired,
    };
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            isLoggedIn: null,
            email: "",
            hasNextPage: false,
            isLoading: false,
            nextCursor: 0,
            showAlert: false,
            variant: "primary",
            alertText: "",
        };
    }

    componentDidMount() {
        fetch("data/contributors.json")
            .then((resp) => resp.json())
            .then((contributors) => this.setState({ contributors }));

        this.loadData = this.loadData.bind(this);
        this.loginSuccess = this.loginSuccess.bind(this);
        this.logoutSuccess = this.logoutSuccess.bind(this);
        this.updateLoginStatus = this.updateLoginStatus.bind(this);
        this.updateLoginStatus();
        this.loadData();

        // console.log(JSON.stringify(this.props));

        if (this.props.location.state) {
            const showAlert = Boolean(this.props.location.state.showAlert);
            const variant = this.props.location.state.variant || "";
            const alertText = this.props.location.state.alertText || "";

            this.setState({ showAlert, variant, alertText });
            this.props.history.replace();
        }
    }

    loadData() {
        this.setState({ isLoading: true });
        const token = this.props.cookies.get("tokenId");
        const url = !this.state.nextCursor
            ? "/MCQ/list"
            : `/MCQ/list?cursor=${this.state.nextCursor}`;
        const options = token
            ? {
                  headers: {
                      token,
                  },
              }
            : {};

        fetch(url, options)
            .then((resp) => resp.json())
            .then((data) => {
                const { OK, response, nextPage } = data;
                if (OK) {
                    const cdata = this.state.data;
                    this.setState({ data: [...cdata, ...response] });
                    if (nextPage > 0) {
                        this.setState({
                            nextCursor: nextPage,
                            hasNextPage: true,
                            isLoading: false,
                        });
                    } else {
                        this.setState({
                            hasNextPage: false,
                            isLoading: false,
                        });
                    }
                } else {
                    this.setState({
                        isLoading: false,
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
                // console.log(JSON.stringify(data));
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
                        onSuccess={this.logoutSuccess}
                        email={this.state.email}
                    />
                )}
                <Container style={{ padding: "20px" }}>
                    {this.state.isLoggedIn === false && (
                        <Alert variant="info" style={{ marginBottom: "2rem" }}>
                            Login with registered Google Account to access the
                            internal tools.
                            <div className="d-flex justify-content-end">
                                <GoogleLogin
                                    clientId="310703059955-ocms672ir8c4emu5gar5v5f5je4srifh.apps.googleusercontent.com"
                                    render={(renderProps) => (
                                        <Button
                                            variant="outline-info"
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
                                    onSuccess={this.loginSuccess}
                                    cookiePolicy={"single_host_origin"}
                                />
                            </div>
                        </Alert>
                    )}
                    {_.isEmpty(this.state.data) ? (
                        <>
                            {_.times(3, (id) => (
                                <CardPlaceholder key={id} />
                            ))}
                        </>
                    ) : (
                        <>
                            <Alert
                                show={this.state.showAlert}
                                variant={this.state.variant}
                                className="rounded-0"
                            >
                                {this.state.alertText}
                            </Alert>

                            {this.state.isLoggedIn && (
                                <div className="d-flex justify-content-center mb-3">
                                    <Button as={Link} to="/post">
                                        Post Question
                                    </Button>
                                </div>
                            )}
                            {this.state.data.map(
                                (d) =>
                                    (this.state.isLoggedIn || d.published) && (
                                        <Link
                                            to={"/question/" + d.docId}
                                            key={d.docId}
                                            style={{
                                                textDecoration: "none",
                                                color: "inherit",
                                            }}
                                        >
                                            <CustomCard
                                                style={{
                                                    borderColor: d.published
                                                        ? "inherit"
                                                        : "red",
                                                }}
                                            >
                                                <Card.Body>
                                                    <Card.Title
                                                        as={"b"}
                                                        style={{
                                                            fontSize: "0.75rem",
                                                        }}
                                                    >
                                                        Created by{" "}
                                                        {this.getContributorName(
                                                            d.author
                                                        )}{" "}
                                                        on{" "}
                                                        {this.timestampToDate(
                                                            d.date
                                                        )}{" "}
                                                    </Card.Title>
                                                    <Text>{d.question}</Text>
                                                </Card.Body>
                                            </CustomCard>
                                        </Link>
                                    )
                            )}
                            {this.state.isLoading && <CardPlaceholder />}
                            <div className="d-flex justify-content-center mb-3">
                                <Button
                                    disabled={!this.state.hasNextPage}
                                    onClick={this.loadData}
                                >
                                    Load More
                                </Button>
                            </div>
                        </>
                    )}
                </Container>
            </>
        );
    }
}

export default withCookies(Questions);
