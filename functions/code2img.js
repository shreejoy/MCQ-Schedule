const fetch = require("node-fetch");
const { sample } = require("lodash");
const firebase = require("firebase-admin");

const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64")
);

if (firebase.apps.length === 0) {
    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
    });
}

const bucket = firebase
    .storage()
    .bucket("gs://coding-wizards-club.appspot.com");

const theme = sample([
    "a11y-dark",
    "atom-dark",
    "base16-ateliersulphurpool.light",
    "cb",
    "darcula",
    "default",
    "dracula",
    "duotone-dark",
    "duotone-earth",
    "duotone-forest",
    "duotone-light",
    "duotone-sea",
    "duotone-space",
    "ghcolors",
    "hopscotch",
    "material-dark",
    "material-light",
    "material-oceanic",
    "nord",
    "pojoaque",
    "shades-of-purple",
    "synthwave84",
    "vs",
    "vsc-dark-plus",
    "xonokai",
]);

exports.handler = async (event, context) => {
    const language = event.queryStringParameters.language;
    const name = Date.now().toString();

    if (!event.body || !language) {
        return {
            statusCode: 500,
            headers: {
                "content-type": `application/json`,
            },
            body: JSON.stringify({ OK: false, error: "Insufficient data." }),
            isBase64Encoded: false,
        };
    }

    const response = await fetch(
        `https://code2img.vercel.app/api/to-image?language=${language}&theme=${theme}&padding=0`,
        {
            method: "POST",
            body: event.body,
        }
    );

    const image = await response.buffer();
    const file = bucket.file(`${name}.png`);

    await file.save(image, {
        public: true,
        resumable: false,
        metadata: {
            contentType: "image/png",
        },
    });

    return {
        statusCode: 200,
        headers: {
            "content-type": `application/json`,
        },
        body: JSON.stringify({
            theme,
            language,
            OK: true,
            screenshot: file.publicUrl(),
        }),
        isBase64Encoded: false,
    };
};
