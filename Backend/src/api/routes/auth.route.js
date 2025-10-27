const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller.js");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints for user registration, login, and Google OAuth
 */

/**
 * @swagger
 * /api/auth/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with a unique username, email, and password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 12345678
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Username or email already exists
 *       500:
 *         description: Signup failed due to server error
 */
router.post("/users/register", controller.register);


/**
 * @swagger
 * /api/auth/users/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user using email and password and returns a JWT token.
 *     tags: [Auth]
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
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Login failed due to server error
 */
router.post("/users/login", controller.login);


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and social login endpoints
 */

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Sign in with Google
 *     description: >
 *       Logs in a user via Google account. -->   
 *       If the user already exists (matched by email), returns their data and a JWT token in cookies --> 
 *       If the user does not exist, automatically creates a new account with a generated password and returns it.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - photo
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@gmail.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               photo:
 *                 type: string
 *                 format: uri
 *                 example: https://lh3.googleusercontent.com/a-/AOh14GgrmRzP123
 *     responses:
 *       200:
 *         description: Successfully logged in or registered via Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 670bb2e8f1a9317dbe03a40c
 *                 username:
 *                   type: string
 *                   example: johndoe8a3b7f2
 *                 email:
 *                   type: string
 *                   example: johndoe@gmail.com
 *                 avatar:
 *                   type: string
 *                   example: https://lh3.googleusercontent.com/a-/AOh14GgrmRzP123
 *       500:
 *         description: Google login failed due to server error
 */
router.post("/google", controller.google)


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and social login endpoints
 */

/**
 * @swagger
 * /api/auth/users/forgot-password:
 *   post:
 *     summary: Request password reset via email
 *     description: >
 *       Generates a 6-digit OTP and sends it to the user's registered email address.  
 *       The OTP is valid for **5 minutes**.  
 *       This step is used to verify identity before allowing a password reset.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Đã gửi mã OTP qua email!
 *       400:
 *         description: Email does not exist or is invalid
 *       500:
 *         description: Server error while generating or sending OTP
 */
router.post("/users/forgot-password", controller.forgotPassword);



module.exports = router;