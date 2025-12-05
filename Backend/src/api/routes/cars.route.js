const express = require("express");
const router = express.Router();
const controller = require("../controllers/cars.controller.js");

/**
 * Description: Get all cars with pagination, search, and filtering
 * Path: /cars/listing
 * Method: GET
 */
router.get("/listing", controller.getCars);

/**
 * Description: Get specific car details by ID
 * Path: /cars/:id
 * Method: GET
 */
router.get("/:id", controller.getCarDetail);

module.exports = router;
