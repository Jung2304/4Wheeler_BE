const path = require("path");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const YAML = require("yaml");

const file = fs.readFileSync(path.resolve(__dirname, "4Wheeler-swagger.yaml"), "utf8");
const swaggerDocument = YAML.parse(file);

module.exports.swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 
  console.log("📄 Swagger Docs available at http://localhost:4000/api-docs"); 
};