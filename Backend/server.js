//! NPM PACKAGES
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();     

//! FIREBASE INIT
require("./src/api/config/firebase.js");

//! INTERNAL FILES
const routes = require("./src/api/routes/index.route.js");
const { swaggerDocs } = require("./src/swagger.js");

//! CONFIG
const properties = require("./src/api/config/properties.js");     
const database = require("./src/api/config/database.js");

//! APP
const app = express();  

//! MIDDLEWARES
app.use(cors(properties.CORS));                       // Allow cross-origin requests from specified domains

app.use(morgan("dev"));                 // Log HTTP requests
app.use(bodyParser.json());             // Parse JSON bodies
app.use(cookieParser());                // Parse cookie header
app.use(bodyParser.urlencoded({ extended: true }));     // Parse URL-encoded bodies

//! DATABASE
database.connect();       // kết nối database 

//! ROUTES
routes(app);   

//! SWAGGER SETUP
swaggerDocs(app);      

//! SERVER
const port = process.env.PORT || 8000;      
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
}); 
