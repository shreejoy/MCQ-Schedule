import React from "react";
import _ from "lodash";
import { GoogleLogout, GoogleLogin } from "react-google-login";
import { Alert, Button, Spinner } from "react-bootstrap";
import { withCookies } from "react-cookie";
import { connect } from "react-redux";
import { setAuth, setUser } from "../../redux/actions/actions";

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

class AlertLoginInfo extends React.Component {
    constructor(props) {
        super(props);
        this.updateLoginStatus = this.updateLoginStatus.bind(this);
        this.loginSuccess = this.loginSuccess.bind(this);
        this.logoutSuccess = this.logoutSuccess.bind(this);
        this.updateLoginStatus();
        this.props.cookies.addChangeListener(() => {
          window.location.reload();
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
                if (data.OK) {
                    this.props.dispatch(setAuth(true));
                    this.props.dispatch(setUser(data.contributor));
                } else {
                    this.props.dispatch(setAuth(false));
                }

            })
            .catch((err) => {
                setTimeout(() => this.props.dispatch(setAuth(false)), 2000);
            });
    }

    loginSuccess(data) {
        const tokenId = data.tokenId;
        const email = data.profileObj.email;

        const isContributor = this.props.state.contributors.some(
            (contributor) => contributor.email === email
        );

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
        return this.props.state.auth === true &&
            this.props.state.user !== null ? (
            <Alert variant="info" className="rounded-0">
                You are logged in as <b>{this.props.state.user.email}</b>
                {" ("}
                <GoogleLogout
                    clientId="310703059955-ocms672ir8c4emu5gar5v5f5je4srifh.apps.googleusercontent.com"
                    render={(renderProps) => (
                        <span
                            style={{
                                cursor: "pointer",
                                textDecoration: "underline",
                            }}
                            onClick={renderProps.onClick}
                        >
                            logout
                        </span>
                    )}
                    onLogoutSuccess={this.logoutSuccess}
                    cookiePolicy={"single_host_origin"}
                />
                {")"}
            </Alert>
        ) : (
            <Alert variant="info" style={{ marginBottom: "2rem" }}>
                Login with registered Google Account to access the internal
                tools.
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
                                {(_.isEmpty(this.props.state.contributors) || renderProps.disabled) ? (
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
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withCookies(AlertLoginInfo));
