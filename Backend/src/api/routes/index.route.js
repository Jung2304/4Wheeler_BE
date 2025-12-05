const authRouter = require("./auth.route.js");
const carsRouter = require("./cars.route.js");
const verifyToken = require("../middlewares/verifyToken.js");

module.exports = (app) => {
  app.use("/api/auth", authRouter);
  app.use("/api/cars", carsRouter);

  app.use("/protected", verifyToken, (req, res) => {
    res.json({
      message: "Access granted to protected route",
      user: req.user,
    })
  });
};