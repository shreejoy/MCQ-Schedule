const _ = require("lodash");
const fetch = require("node-fetch");
const auth = require("./utils/auth");
const { database } = require("./utils/firebase");

const validate = require("./utils/validate");
const telegram = require("node-telegram-bot-api");

const bot = new telegram(process.env.bot_token, { polling: false });

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
            const lastDoc = await collection
                .orderBy("index", "desc")
                .limit(1)
                .get();
            body.index =
                lastDoc.size > 0 ? lastDoc.docs[0].data().index + 1 : 0;
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
                    error,
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
                response = [];
            const collection = database.collection("questions");

            if (cursor) {
                questions = await collection
                    .orderBy("index", "desc")
                    .startAfter(cursor)
                    .limit(10)
                    .get();
            } else {
                questions = await collection
                    .orderBy("index", "desc")
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

            const nextPage = response[response.length - 1]["index"];

            return {
                statusCode: 200,
                headers: {
                    "content-type": `application/json`,
                },
                body: JSON.stringify({
                    OK: true,
                    response,
                    nextPage,
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
                    error,
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
                    error,
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

            if (questionDoc.data().published) {
                throw new Error("Question is already published");
            }

            if (action === "approve") {
                const {
                    code,
                    index,
                    question,
                    explanation,
                    correct_option,
                    option_1_value: option_1,
                    option_2_value: option_2,
                    option_3_value: option_3,
                    option_4_value: option_4,
                } = questionDoc.data();

                const options = [option_1, option_2, option_3, option_4];

                const correct_option_id = _.indexOf(
                    options,
                    questionDoc.data()[`${correct_option}_value`]
                );

                if (code) {
                    const url = `${rawUrl}/screenshot/code?t=${theme}&code=${encodeURIComponent(
                        code
                    )}`;

                    const res = await fetch(url);
                    const image = await res.buffer();

                    const sendPhoto = await bot.sendPhoto(
                        "-1001234543125",
                        image
                    );

                    const sendPoll = await bot.sendPoll(
                        "-1001234543125",
                        question,
                        options,
                        {
                            reply_to_message_id: sendPhoto.message_id,
                            is_anonymous: false,
                            correct_option_id,
                            explanation,
                            type: "quiz",
                        }
                    );

                    return {
                        statusCode: 200,
                        headers: {
                            "content-type": `application/json`,
                        },
                        body: JSON.stringify(sendPoll),
                        isBase64Encoded: false,
                    };
                } else {
                    const sendPoll = await bot.sendPoll(
                        "-1001234543125",
                        question,
                        options,
                        {
                            is_anonymous: false,
                            correct_option_id,
                            explanation,
                            type: "quiz",
                        }
                    );

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
                await questionRef.delete();
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
                    ...authentication,
                    OK: false,
                    code: 3,
                }),
                isBase64Encoded: false,
            };
        }
    }
};
