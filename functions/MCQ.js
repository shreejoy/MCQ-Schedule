const _ = require("lodash");
const auth = require("./utils/auth");

const validate = require("./utils/validate");
const telegram = require("node-telegram-bot-api");

const firebase = require("firebase-admin");

const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64")
);

if (firebase.apps.length === 0) {
    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
    });
}

const database = firebase.firestore();

const bot = new telegram(
    process.env.bot_token || "781484580:AAE6QDtK0TToc4pDJj3LxC8hVlO3iD4TmXY",
    { polling: false }
);

exports.handler = async (event, context) => {
    const path = event.path;
    const httpMethod = event.httpMethod;

    if (path.startsWith("/MCQ/create") && httpMethod === "POST") {
        const { value, error } = validate.validateMCQCreate(
            Object.fromEntries(new URLSearchParams(event.body)),
            event.headers
        );

        if (error) {
            return {
                statusCode: 400,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({ error, OK: false, code: 1 }),
                isBase64Encoded: false,
            };
        }

        const { body, headers } = value;
        const rawUrl = new URL(event.rawUrl).origin;
        const authentication = await auth(headers.token, rawUrl);
        if (!authentication.OK) {
            return {
                statusCode: 400,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({
                    ...authentication,
                    OK: false,
                    code: 2,
                }),
                isBase64Encoded: false,
            };
        }

        try {
            const collection = database.collection("questions");
            const question = collection.doc();
            await question.set(body);

            return {
                statusCode: 200,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({ OK: true, ...body }),
                isBase64Encoded: false,
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({
                    error: error.message,
                    OK: false,
                    code: 3,
                }),
                isBase64Encoded: false,
            };
        }
    } else if (path.startsWith("/MCQ/list") && httpMethod === "GET") {
        const { value, error } = validate.validateMCQList(
            Object.fromEntries(new URLSearchParams(event.rawQuery)),
            event.headers
        );

        if (error) {
            return {
                statusCode: 400,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({ error, OK: false, code: 1 }),
                isBase64Encoded: false,
            };
        }

        const { query, headers } = value;
        const cursor = parseInt(query.cursor);
        const rawUrl = new URL(event.rawUrl).origin;
        const authentication = await auth(headers.token, rawUrl);

        try {
            var questions,
                response = [],
                body = {};
            const collection = database.collection("questions");

            if (cursor) {
                questions = await collection
                    .orderBy("date", "desc")
                    .startAfter(cursor)
                    .limit(10)
                    .get();
            } else {
                questions = await collection
                    .orderBy("date", "desc")
                    .limit(10)
                    .get();
            }

            questions.forEach((question) => {
                const docId = question.id;
                const docData = question.data();

                if (!authentication.OK) {
                    delete docData.correct_option;
                    delete docData.explaination;
                }
                response.push({ docId, ...docData });
            });

            if (response.length) {
                body.response = response;
                body.count = response.length;
                const nextCursor = _.last(response).date;
                const nextQuestion = await collection
                    .orderBy("date", "desc")
                    .startAfter(nextCursor)
                    .limit(1)
                    .get();
                if (nextQuestion.size) {
                    body.nextPage = true;
                    body.nextCursor = nextCursor;
                } else body.nextPage = false;
            } else {
                body.nextPage = false;
            }

            return {
                statusCode: 200,
                body: JSON.stringify(body),
                headers: {
                    "content-type": `application/json`,
                },
                isBase64Encoded: false,
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({
                    error: error.message,
                    OK: false,
                    code: 3,
                }),
                isBase64Encoded: false,
            };
        }
    } else if (path.startsWith("/MCQ/question") && httpMethod === "GET") {
        const { value, error } = validate.validateMCQQuestion(
            Object.fromEntries(new URLSearchParams(event.rawQuery)),
            event.headers
        );

        if (error) {
            return {
                statusCode: 400,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({ error, OK: false, code: 1 }),
                isBase64Encoded: false,
            };
        }

        const { query, headers } = value;
        const rawUrl = new URL(event.rawUrl).origin;
        const authentication = await auth(headers.token, rawUrl);
        const docId = query.id;

        try {
            const collection = database.collection("questions");
            const question = await collection.doc(docId).get();
            if (!question.exists) throw Error("Question not found");
            const docData = question.data();

            if (!authentication.OK) {
                if (!docData.published) throw Error("Question not found");
                delete docData.correct_option;
                delete docData.explaination;
            }

            return {
                statusCode: 200,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({
                    OK: true,
                    response: { docId, ...docData },
                    query,
                    authentication,
                }),
                isBase64Encoded: false,
            };
        } catch (error) {
            return {
                statusCode: 500,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({
                    error: error.message,
                    OK: false,
                    code: 3,
                }),
                isBase64Encoded: false,
            };
        }
    } else if (path.startsWith("/MCQ/review") && httpMethod === "POST") {
        const { value, error } = validate.validateMCQreview(
            Object.fromEntries(new URLSearchParams(event.body)),
            event.headers
        );

        if (error) {
            return {
                statusCode: 400,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({ error, OK: false, code: 1 }),
                isBase64Encoded: false,
            };
        }

        const { body, headers } = value;
        const rawUrl = new URL(event.rawUrl).origin;
        const authentication = await auth(headers.token, rawUrl);

        if (!authentication.OK) {
            return {
                statusCode: 400,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({
                    ...authentication,
                    OK: false,
                    code: 2,
                }),
                isBase64Encoded: false,
            };
        }

        try {
            const { id, action } = body;
            const collection = database.collection("questions");
            const questionRef = collection.doc(id);
            const questionDoc = await questionRef.get();
            if (!questionDoc.exists) {
                throw new Error("Question does not exist");
            }

            // if (questionDoc.data().published) {
            //     throw new Error("Question is already published");
            // }

            if (action === "approve") {
                const {
                    code,
                    question,
                    screenshot,
                    explanation,
                    correct_option,
                    option_1_value,
                    option_2_value,
                    option_3_value,
                    option_4_value,
                } = questionDoc.data();

                const options = [
                    option_1_value,
                    option_2_value,
                    option_3_value,
                    option_4_value,
                ];

                const correct_option_id = _.indexOf(
                    options,
                    questionDoc.data()[`${correct_option}_value`]
                );

                if (code) {
                    if (!screenshot) throw Error("Screenshot not found");
                    const sendPhoto = await bot.sendPhoto(
                        "-1001234543125",
                        screenshot
                    );

                    await bot.sendPoll("-1001234543125", question, options, {
                        reply_to_message_id: sendPhoto.message_id,
                        is_anonymous: false,
                        correct_option_id,
                        explanation,
                        type: "quiz",
                    });

                    return {
                        statusCode: 200,
                        headers: {
                            "content-type": `application/json`,
                        },
                        body: JSON.stringify({ OK: true }),
                        isBase64Encoded: false,
                    };
                } else {
                    await bot.sendPoll("-1001234543125", question, options, {
                        is_anonymous: false,
                        correct_option_id,
                        explanation,
                        type: "quiz",
                    });

                    return {
                        statusCode: 200,
                        headers: {
                            "content-type": `application/json`,
                        },
                        body: JSON.stringify({ OK: true }),
                        isBase64Encoded: false,
                    };
                }
            } else if (action === "reject") {
                // await questionRef.delete();
                return {
                    statusCode: 200,
                    headers: {
                        "content-type": `application/json`,
                    },
                    body: JSON.stringify({ OK: true }),
                    isBase64Encoded: false,
                };
            }
        } catch (error) {
            return {
                statusCode: 400,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({
                    error: error.message,
                    OK: false,
                    code: 3,
                }),
                isBase64Encoded: false,
            };
        }
    }
};
