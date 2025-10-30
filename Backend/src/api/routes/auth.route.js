const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller.js");

//! Middleware
const { verifyGoogleOauth } = require("../middlewares/verifyGoogleOauth.js");

/**
 * Description: Register a new user
 * Path: /users/register
 * Method: POST
 * Body: { username: string, email: string, password: string }
 */
router.post("/users/register", controller.register);

/**
 * Description: User login into service
 * Path: /users/login
 * Method: POST
 * Body: { email: string, password: string }
 */
router.post("/users/login", controller.login);

/**
 * Description: User uses Google account to login or register
 * Path: /users/login
 * Method: POST
 * Body: { email: string, password: string }
 */
router.post("/google", verifyGoogleOauth, controller.google)

/**
 * Description: User requests password reset via email
 * Path: /users/forgot-password
 * Method: POST
 * Body: { email: string }
 */
router.post("/users/forgot-password", controller.forgotPassword);

/**
 * Description: Users verify OTP for password reset
 * Path: /users/otp-password
 * Method: POST
 * Body: { otp: string }
 */
router.post("/users/otp-password", controller.otpPassword);

module.exports = router;