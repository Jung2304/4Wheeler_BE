const authRouter = require("./auth.route.js"); 

module.exports = (app) => {
  app.use("/api/auth", authRouter);


};