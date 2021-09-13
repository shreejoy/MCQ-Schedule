const fetch = require("node-fetch");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "310703059955-ocms672ir8c4emu5gar5v5f5je4srifh.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

exports.handler = async (event, context) => {
  const body = new URLSearchParams(event.body);
  const idToken = body.get("tokenId");

  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const res = await fetch(`https://${event.headers.host}/data/contributors.json`);
    const contributors = await res.json();


    const isContributor = contributors.some(
      (contributor) => contributor.email === payload.email
    );

    return {
      statusCode: 200,
      headers: {
        "content-type": `application/json`,
      },
      body: JSON.stringify({ OK: isContributor, email: payload.email }),
      isBase64Encoded: false,
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: {
        "content-type": `application/json`,
      },
      body: JSON.stringify({ OK: false, error }),
      isBase64Encoded: false,
    };
  }
};
