import express from 'express'
import { loginClientValidator, registerClientValidate } from '../validator/authClientsValidator.js'
import { registerClientHandle ,loginClientHandle} from '../controller/authClientController.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Registration management and customer login
 */
/**
 * @swagger
 * /auth-client/register:
 *   post:
 *     summary: Register a new user (Customer) account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: sielinou fonou
 *               lastName:
 *                 type: string
 *                 example: yvan
 *               email:
 *                 type: string
 *                 example: diderot@gmail.com
 *               phone:
 *                 type: string
 *                 example: +237678678990
 *               password:
 *                 type: string
 *                 example: MyStrongPassword123
 *     responses:
 *       201:
 *         description: Client registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                   type: string 
 *                   example: User registered successfully!
 *                 clientId:
 *                   type: object
 *                   properties:
 *                     id: 
 *                       type: string
 *       400:
 *         description: Validation error (e.g., passwords don't match, invalid email).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
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

router.post('/register', registerClientValidate, registerClientHandle);

/**
 * @swagger
 * /auth-client/login:
 *   post:
 *     summary: Log in a client
 *     tags: [Authentication]
 *     description: Authenticates a client and returns a JWT token.
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
 *               email: { type: string, format: email, example: john.doe@example.com }
 *               password: { type: string, format: password, example: P@sswOrd123 }
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
 *                 user: { $ref: '#/components/schemas/client' }
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

router.post('/login',loginClientValidator,loginClientHandle)


export default router