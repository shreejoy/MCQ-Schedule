const auth = require("./utils/auth");
const capture = require("./utils/capture");
const validate = require("./utils/validate");

const _ = require("lodash");
const firebase = require("firebase-admin");
const telegram = require("node-telegram-bot-api");

const token =
    process.env.bot_token || "781484580:AAEd2SFTXPWgrpuEU6Qjq8IYCSSrvabgLu8";
const bot = new telegram(token, { polling: false });

const themes = [
    "3024-night",
    "a11y-dark",
    "blackboard",
    "base16-dark",
    "base16-light",
    "cobalt",
    "dracula",
    "duotone-dark",
    "hopscotch",
    "lucario",
    "material",
    "monokai",
    "night-owl",
    "nord",
    "oceanic-next",
    "one-light",
    "one-dark",
    "panda-syntax",
    "paraiso-dark",
    "seti",
    "shades-of-purple",
    "solarized dark",
    "solarized light",
    "synthwave-84",
    "twilight",
    "verminal",
    "vscode",
    "yeti",
    "zenburn",
];

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
    const httpMethod = event.httpMethod;

    if (httpMethod === "POST") {
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

        // if (!authentication.OK) {
        //     return {
        //         statusCode: 400,
        //         headers: {
        //             "content-type": `application/json`,
        //         },
        //         body: JSON.stringify({
        //             ...authentication,
        //             OK: false,
        //             code: 2,
        //         }),
        //         isBase64Encoded: false,
        //     };
        // }

        // try {
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
                    index,
                    question,
                    explanation,
                    correct_option,
                    option_1_value: option_1,
                    option_2_value: option_2,
                    option_3_value: option_3,
                    option_4_value: option_4,
                } = questionDoc.data();

                const options = [
                    option_1,
                    option_2,
                    option_3,
                    option_4,
                ];

                const correct_option_id = _.indexOf(
                    options, questionDoc.data()[`${correct_option}_value`]
                )

                if (code) {
                    const theme = _.sample(themes);
                    const url = `https://carbon.now.sh/?t=${theme}&code=${encodeURIComponent(code)}`;
                    const output = await capture(url, ".react-codemirror2");

                    const sendPhoto = await bot.sendPhoto(
                        "-1001234543125",
                        Buffer.from(output, "base64"),
                        {
                            caption: `#${index}`,
                        }
                    );

                    const sendPoll = await bot.sendPoll("-1001234543125", question, options, {
                        reply_to_message_id: sendPhoto.message_id,
                        correct_option_id,
                        explanation,
                        type: 'quiz',
                    });

                    return {
                        statusCode: 200,
                        headers: {
                            "content-type": `application/json`,
                        },
                        body: JSON.stringify(sendPoll),
                        isBase64Encoded: false,
                    };
                } else {
                    const sendPoll = await bot.sendPoll("-1001234543125", question, options, {
                        correct_option_id,
                        explanation,
                        type: 'quiz',
                    });

                    return {
                        statusCode: 200,
                        headers: {
                            "content-type": `application/json`,
                        },
                        body: JSON.stringify(sendPoll),
                        isBase64Encoded: false,
                    };
                }
            } else if (action === "reject") {
                await questionRef.delete();
            }
        // } catch (error) {
        //     return {
        //         statusCode: 400,
        //         headers: {
        //             "content-type": `application/json`,
        //         },
        //         body: JSON.stringify({
        //             ...authentication,
        //             OK: false,
        //             code: 3,
        //         }),
        //         isBase64Encoded: false,
        //     };
        // }
    }
};
