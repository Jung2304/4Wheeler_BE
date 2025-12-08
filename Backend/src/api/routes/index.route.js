const authRouter = require("./auth.route.js");
const carsRouter = require("./cars.route.js");
const adminRouter = require("./admin.route.js");

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.send("4Wheeler API is running 🚗");
  });

  app.use("/api/auth", authRouter);
  app.use("/api/cars", carsRouter);
  app.use("/api/admin", adminRouter);

};