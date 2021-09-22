const { bucket } = require("./constants")
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
const storage = firebase.storage().bucket(bucket);

module.exports = {
    database, storage
};