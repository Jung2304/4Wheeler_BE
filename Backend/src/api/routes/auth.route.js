const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller.js");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/auth/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new account with username, email, and password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username (unique)
 *               - email (unique)
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Field {username || email} already exists
 *       500:
 *         description: Signup failed
 */
router.post("/users/register", controller.register);


/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/auth/users/login:
 *   post:
 *     summary: User signing in
 *     description: User signing in by email and password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email 
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login successfully
 *       401:
 *         description: Wrong credentials
 *       404:
 *         description: User not found (email not found)
 *       500:
 *         description: Login failed
 */
router.post("/users/login", controller.login);



router.post("/google", controller.google)


module.exports = router;