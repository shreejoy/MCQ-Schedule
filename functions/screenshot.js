// const _ = require("lodash");
// const auth = require("./utils/auth");
// const capture = require("./utils/capture");
// const { storage, database } = require("./utils/firebase");
// const { themes } = require("./utils/constants");
// const validate = require("./utils/validate");


exports.handler = async (event, context) => {
    // if (event.path === "/screenshot") {
    //     const component = event.path.slice(12);
    //     const output = await capture(
    //         new URL(event.rawUrl).origin,
    //         !component
    //             ? "#root"
    //             : component === "table"
    //             ? "table"
    //             : `#${component}`
    //     );

    //     return {
    //         statusCode: 200,
    //         headers: {
    //             "content-type": `image/png`,
    //         },
    //         body: output,
    //         isBase64Encoded: true,
    //     };
    // } else if (
    //     event.path === "/screenshot/code" &&
    //     event.httpMethod == "POST"
    // ) {
    //     const { value, error } = validate.validateMCQScreenshot(
    //         Object.fromEntries(new URLSearchParams(event.body)),
    //         event.headers
    //     );

    //     if (error) {
    //         return {
    //             statusCode: 400,
    //             headers: {
    //                 "content-type": `application/json`,
    //             },
    //             body: JSON.stringify({ error, OK: false, code: 1 }),
    //             isBase64Encoded: false,
    //         };
    //     }

    //     const authentication = await auth(event.headers.token, event.rawUrl);
    //     // if (!authentication.OK) {
    //     //     return {
    //     //         statusCode: 400,
    //     //         headers: {
    //     //             "content-type": `application/json`,
    //     //         },
    //     //         body: JSON.stringify({
    //     //             ...authentication,
    //     //             OK: false,
    //     //             code: 2,
    //     //         }),
    //     //         isBase64Encoded: false,
    //     //     };
    //     // }

    //     const theme = _.sample(themes);
    //     const collection = database.collection("questions");

    //     // try {
    //         const question = await collection.doc(value.body.id).get();
    //         if (!question.exists) throw Error("Question not found");
    //         const code = question.data().code;
    //         if (!code) throw Error("Question has no code to build image");
    //         const url = `https://carbon.now.sh/?t=${theme}&code=${encodeURIComponent(
    //             code
    //         )}`;

    //         const output = await capture(url, ".export-container");

    //         return {
    //             statusCode: 200,
    //             headers: {
    //                 "content-type": `image/png`,
    //             },
    //             body: output,
    //             isBase64Encoded: true,
    //         };
    //     // } catch (error) {
    //     //     return {
    //     //         statusCode: 500,
    //     //         headers: {
    //     //             "content-type": `application/json`,
    //     //         },
    //     //         body: JSON.stringify({
    //     //             error,
    //     //             OK: false
    //     //         }),
    //     //         isBase64Encoded: false,
    //     //     };
    //     // }

    //     return {
    //         statusCode: 200,
    //         headers: {
    //             "content-type": `image/png`,
    //         },
    //         body: output,
    //         isBase64Encoded: true,
    //     };
    // }
};
