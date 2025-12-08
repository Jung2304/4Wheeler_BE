const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const cookieToken = req.cookies.access_token;
    const headerToken = req.headers.authorization?.split(" ")[1];
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided!" });
    } 
    else {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    }
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token!" });
  }
};