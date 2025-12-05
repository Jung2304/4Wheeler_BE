const admin = require("../config/firebase.js");

// Middleware to verify Google OAuth ID token
module.exports.verifyGoogleOauth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Missing ID token!" });
    }

    // Verify token with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Attach decoded info to request object for next handlers
    req.googleUser = {
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };

    next();
  } catch (error) {
    console.error("Google token verification failed:", error);
    return res.status(401).json({ message: "Invalid or expired ID token!" });
  }
};