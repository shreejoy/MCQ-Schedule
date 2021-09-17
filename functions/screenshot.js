const chromium = require("chrome-aws-lambda");
const capture = require("./utils/capture");

exports.handler = async (event, context) => {
    const component = event.path.slice(12);
    const output = await capture(
        new URL(event.rawUrl).origin,
        !component ? "#root" : component === "table" ? "table" : `#${component}`
    );
    return {
        statusCode: 200,
        headers: {
            "content-type": `image/png`,
        },
        body: output,
        isBase64Encoded: true,
    };
};
