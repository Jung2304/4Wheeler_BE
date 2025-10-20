// swagger.js
const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "4Wheeler API Documentation",
      version: "1.0.0",
      description: "API documentation for the 4Wheeler Website",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Local server",
      },
    ],
  },
  apis: [path.join(__dirname,"./api/routes/*.js")],    // Absolute path
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app) {
  console.log("📘 Swagger loaded routes from:", options.apis);
  console.log("📘 Swagger found definitions count:", Object.keys(swaggerSpec.paths || {}).length);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📄 Swagger Docs available at http://localhost:4000/api-docs");
}

module.exports = swaggerDocs;
