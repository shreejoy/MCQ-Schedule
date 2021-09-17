import React from "react";
import { GoogleLogin } from "react-google-login";
import { Spinner, Button } from "react-bootstrap";

class LoginButton extends React.Component {
    render() {
        return (
            <GoogleLogin
                clientId="310703059955-ocms672ir8c4emu5gar5v5f5je4srifh.apps.googleusercontent.com"
                render={(renderProps) => (
                    <Button
                        variant={this.props.variant}
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
                onSuccess={this.props.onSuccess}
                cookiePolicy={"single_host_origin"}
            />
        );
    }
}

export default LoginButton;
