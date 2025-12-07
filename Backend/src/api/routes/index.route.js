const authRouter = require("./auth.route.js");
const carsRouter = require("./cars.route.js");
const verifyToken = require("../middlewares/verifyToken.js");

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.send("4Wheeler API is running 🚗");
  });

  app.use("/api/auth", authRouter);
  app.use("/api/cars", carsRouter);

  
};