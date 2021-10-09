const fetch = require("node-fetch");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
    "310703059955-ocms672ir8c4emu5gar5v5f5je4srifh.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const auth = async (idToken, rawUrl) => {
    
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const res = await fetch(`${rawUrl}/data/contributors.json`);
        const contributors = await res.json();

        const contributor = contributors.find(
            (contributor) => contributor.email === payload.email
        );

        if (!Boolean(contributor)) {
            throw Error()
        }

        return { OK: Boolean(contributor), email: payload.email, contributor };
    } catch (error) {
        return { OK: false, error: "Invalid authorization token" };
    }
};

module.exports = auth;