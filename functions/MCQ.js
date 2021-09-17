const _ = require("lodash");
const auth = require("./utils/auth");
const firebase = require("firebase-admin");
const validate = require("./utils/validate");

const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64")
);

if (firebase.apps.length === 0) {
    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
    });
}

const database = firebase.firestore();

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
        const rawUrl = new URL(event.rawUrl).origin;
        const authentication = await auth(headers.token, rawUrl);

        const cursor = parseInt(query.cursor);
        const param = "index";

        try {
            var questions,
                response = [];
            const collection = database.collection("questions");

            if (cursor) {
                questions = await collection
                    .orderBy(param, "desc")
                    .startAfter(cursor)
                    .limit(10)
                    .get();
            } else {
                questions = await collection
                    .orderBy(param, "desc")
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

            const nextPage = response[response.length - 1][param];

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
                    response: {docId, ...docData},
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
    }
};
