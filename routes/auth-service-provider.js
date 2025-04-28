import express from 'express'
import registerServiceProviderHandle from '../controller/register-serviceProvider-controller.js';
import { loginServiceProviderHandle } from '../controller/login-service_provider.js';

const router = express.Router(); 

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Registration management and provider login
 */

/**
 * @swagger
 * /auth-service-provider/register:
 *   post:
 *     summary: Register a new user (provider) account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: sielinou fonou diderot
 *               email:
 *                 type: string
 *                 example: diderot@gmail.com
 *               password:
 *                 type: string
 *                 example: MyStrongPassword123
 *               address:
 *                 type: string
 *                 example: douala
 *               work:
 *                 type: string
 *                 example: Doctor
 *               aboutMyself:
 *                 type: string
 *                 example: "My name is ... I love ..."
 *               phone:
 *                 type: string
 *                 example: +237654678767
 *     responses:
 *       201:
 *         description: Provider registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                   type: string 
 *                   example: "User registered successfully!"
 *                 providerId:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *       400:
 *         description: Validation error (e.g., passwords don't match, invalid email).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                   type: string 
 *                   example: "Validation failed: email is invalid or passwords don't match."
 *       409:
 *         description: Email already in use.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error during registration.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *     security: [] # Override global security - this endpoint is public
 */

router.post('/register', registerServiceProviderHandle)

/**
 * @swagger
 * /auth-service-provider/login:
 *   post:
 *     summary: Log in a provider
 *     tags: [Authentication]
 *     description: Authenticates a provider and returns a JWT token.
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
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: P@sswOrd123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Login successful! }
 *                 token: { type: string, description: JWT token for authentication }
 *                 user: { $ref: '#/components/schemas/provider' }
 *       400:
 *         description: Validation error (e.g., missing fields).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Invalid credentials (email not found or password incorrect).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error during login.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *     security: [] # Override global security - this endpoint is public
 */

router.post('/login', loginServiceProviderHandle)

export default router
