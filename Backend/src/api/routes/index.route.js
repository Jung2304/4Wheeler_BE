const authRouter = require("./auth.route.js"); 
const verifyToken = require("../middlewares/verifyToken.js");

module.exports = (app) => {
  app.use("/api/auth", authRouter);

  app.use("/protected", verifyToken, (req, res) => {
    res.json({
      message: "Access granted to protected route",
      user: req.user,
    })
  });
};