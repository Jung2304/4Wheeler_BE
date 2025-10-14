require("dotenv").config();     // cài package dotenv và require như này để dùng các hằng trong file .env

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

//! CONFIG
const properties = require("./src/config/properties.js");     // cài các biến hệ thống thành biến toàn cục
const database = require("./src/config/database.js");
const apiRoutes = require("./src/config/api.routes.js");

//! APP
const app = express(); 

//! MIDDLEWARES
app.use(cors());                       // Allow cross-origin requests
app.use(morgan("dev"));                 // Log HTTP requests
app.use(bodyParser.json());             // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));     // Parse URL-encoded bodies

//! DATABASE
database.connect();       // kết nối database

//! PORT
const port = process.env.PORT;      // lấy cổng port bên file .env
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

//! ROUTES
app.use("/api", apiRoutes);             // Mount all API routes under /api

