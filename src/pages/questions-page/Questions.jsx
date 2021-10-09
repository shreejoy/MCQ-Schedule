import React from "react";
import _ from "lodash";
import moment from "moment";
import { Container, Alert, Button, Card } from "react-bootstrap";
import Navigation from "../../components/Navbar";

import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

import { Link } from "react-router-dom";
import styled from "styled-components";
import AlertLoginInfo from "../../components/post-page/AlertLoginInfo";
import CardPlaceholder from "../../components/questions-page/CardPlaceholder";
import { connect } from "react-redux";

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

class Questions extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired,
    };
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            hasNextPage: false,
            isLoading: false,
            nextCursor: 0,
            showAlert: false,
        };
    }

    componentDidMount() {
        this.loadData = this.loadData.bind(this);
        this.loadData();

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
        const url = !this.state.nextCursor
            ? "/MCQ/list"
            : `/MCQ/list?cursor=${this.state.nextCursor}`;
        const options = _.set(
            {},
            "headers.token",
            this.props.cookies.get("tokenId")
        );

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

    getContributorName(codeName) {
        const find = this.props.state.contributors.find(
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
                <AlertLoginInfo post={this.loadData} />
                <Container style={{ padding: "20px" }}>
                    {_.isEmpty(this.state.data) ||
                    !this.props.state.contributors ? (
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
                                onClose={() =>
                                    this.setState({ showAlert: false })
                                }
                                dismissible
                            >
                                {this.state.alertText}
                            </Alert>

                            {this.props.state.auth && (
                                <div className="d-flex justify-content-center mb-3">
                                    <Button as={Link} to="/post">
                                        Post Question
                                    </Button>
                                </div>
                            )}
                            {this.state.data.map(
                                (d) =>
                                    (this.props.state.auth || d.published) && (
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withCookies(Questions));
