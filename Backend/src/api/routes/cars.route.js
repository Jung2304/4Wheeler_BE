const express = require("express");
const router = express.Router();
const controller = require("../controllers/cars.controller.js");
const verifyToken = require("../middlewares/verifyToken.js");
const verifyAdmin = require("../middlewares/verifyAdmin.js");

/**
 * Description: Get all cars with pagination, search, and filtering
 * Path: /listing
 * Method: GET
 */
router.get("/listing", controller.getCars);

/**
 * Description: Get specific car details by ID
 * Path: /:id
 * Method: GET
 */
router.get("/:id", controller.getCarDetail);

/**
 * Description: Get user's favorite cars
 * Path: /user/favorites
 * Method: GET
 * Auth: Required
 */
router.get("/user/favorites", verifyToken, controller.getUserFavorites);

/**
 * Description: Add car to user's favorites
 * Path: /favorites/:carId
 * Method: POST
 * Auth: Required
 */
router.post("/favorites/:carId", verifyToken, controller.addToFavorites);

/**
 * Description: Remove car from user's favorites
 * Path: /favorites/:carId
 * Method: DELETE
 * Auth: Required
 */
router.delete("/favorites/:carId", verifyToken, controller.removeFromFavorites);

module.exports = router;
