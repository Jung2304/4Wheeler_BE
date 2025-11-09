const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1];

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