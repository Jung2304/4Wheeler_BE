const admin = require("firebase-admin");

const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

//! FIREBASE ADMIN INIT
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

module.exports = admin;
