const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();     // cài package dotenv và require như này để dùng các hằng trong file .env

//! CONFIG
const properties = require("./src/config/properties.js");     // cài các biến hệ thống thành biến toàn cục
const database = require("./src/config/database.js");

//! APP
const app = express();  

//! MIDDLEWARES
app.use(cors());                       // Allow cross-origin requests
app.use(morgan("dev"));                 // Log HTTP requests
app.use(bodyParser.json());             // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));     // Parse URL-encoded bodies

//! PORT
const port = process.env.PORT || 8000;      
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});    

//! DATABASE
database.connect();       // kết nối database 
