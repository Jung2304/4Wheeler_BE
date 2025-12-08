const express = require("express");
const router = express.Router();
const controller = require("../controllers/cars.controller.js");
const verifyAdmin = require("../middlewares/verifyAdmin.js");
const upload = require("../middlewares/upload.js");

//! Admin Routes (Protected)
// Place more specific routes first, then more general routes after.

/**
 * Description: Create a new car with image uploads (admin only)
 * Path: /admin/cars/create
 * Method: POST
 * Auth: Required (Admin)
 * Files: Multiple images (optional)
 */
router.post("/cars/create", verifyAdmin, upload.array("images", 5), controller.createCar);

/**
 * Description: Get all cars including deleted (admin only)
 * Path: /admin/cars
 * Method: GET
 * Auth: Required (Admin)
 */
router.get("/cars", verifyAdmin, controller.getAllCars);

/**
 * Description: Get specific car details by ID including deleted (admin only)
 * Path: /admin/cars/:id
 * Method: GET
 * Auth: Required (Admin)
 */
router.get("/cars/:id", verifyAdmin, controller.getCarDetailAdmin);

/**
 * Description: Update car details (admin only)
 * Path: /admin/cars/:id
 * Method: PUT
 * Auth: Required (Admin)
 */
router.put("/cars/:id", verifyAdmin, controller.updateCar);

/**
 * Description: Delete car (soft delete) (admin only)
 * Path: /admin/cars/:id
 * Method: DELETE
 * Auth: Required (Admin)
 */
router.delete("/cars/:id", verifyAdmin, controller.deleteCar);

module.exports = router;