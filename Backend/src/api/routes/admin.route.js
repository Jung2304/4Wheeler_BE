const express = require("express");
const router = express.Router();
const controller = require("../controllers/cars.controller.js");
const verifyAdmin = require("../middlewares/verifyAdmin.js");

//! Admin Routes (Protected)

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
 * Description: Create a new car (admin only)
 * Path: /admin/cars/create
 * Method: POST
 * Auth: Required (Admin)
 */
router.post("/cars/create", verifyAdmin, controller.createCar);

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