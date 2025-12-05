const admin = require("firebase-admin");
const serviceAccount = require("../../../wheeler-32b8c-firebase-adminsdk-fbsvc-f7d358d1de.json");    // Firebase private key file

//! FIREBASE ADMIN INIT
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
