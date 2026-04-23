const admin = require('firebase-admin');

let serviceAccount;

// In production, NEVER require a local JSON file. We build the credential securely from .env variables.
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key string must properly interpret newline characters and strip accidental quotes
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
    };
} else {
    // Fallback ONLY if .env is missing (e.g. initial dev setup). In true production, this file shouldn't exist.
    try {
        serviceAccount = require('./serviceAccountKey.json');
    } catch (error) {
        console.error("Firebase Security Warning: No Firebase environment variables found and no fallback JSON exists.");
    }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
