const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const swaggerDocs = require("./src/swagger.js");
const cookieParser = require("cookie-parser");
const routes = require("./src/api/routes/index.route.js");

require("dotenv").config();     

//! CONFIG
const properties = require("./src/api/config/properties.js");     // cài các biến hệ thống thành biến toàn cục
const database = require("./src/api/config/database.js");

//! APP
const app = express();  

//! MIDDLEWARES
app.use(cors());                       // Allow cross-origin requests
app.use(morgan("dev"));                 // Log HTTP requests
app.use(bodyParser.json());             // Parse JSON bodies
app.use(cookieParser());                // Parse cookie header
app.use(bodyParser.urlencoded({ extended: true }));     // Parse URL-encoded bodies

//! PORT
const port = process.env.PORT || 8000;      
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});    

//! DATABASE
database.connect();       // kết nối database 

//! ROUTES
routes(app);   

//! SWAGGER SETUP
swaggerDocs(app);
