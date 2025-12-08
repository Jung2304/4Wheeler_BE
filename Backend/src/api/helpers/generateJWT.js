const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

module.exports.generateAccessToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.NODE_ENV === "production" ? "http://4Wheeler.com" : "server", 
    sub: user._id.toString(),
    exp: now + 15 * 60,         // 15 mins
    nbf: now,
    iat: now,
    jti: uuidv4(),
    username: user.username,
    email: user.email,
    role: user.role || "user"    // Add role field (defaults to "user")
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  
  return token;
}; 

module.exports.generateRefreshToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    type: "refresh",
    iss: process.env.NODE_ENV === "production" ? "http://4Wheeler.com" : "server", 
    sub: user._id.toString(),
    exp: now + 7 * 24 * 60 * 60,
    nbf: now,
    iat: now,
    jti: uuidv4(),
    username: user.username,
    email: user.email
  };
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET);
  
  return token;
};