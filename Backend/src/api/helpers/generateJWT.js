const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

module.exports.generateJWT = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.NODE_ENV === "production" ? "http://4Wheeler.com" : "server", 
    sub: user._id.toString(),
    exp: now + 60 * 60,
    nbf: now,
    iat: now,
    jti: uuidv4(),
    username: user.username,
    email: user.email
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  
  return token;
}; 