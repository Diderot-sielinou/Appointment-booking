import express from "express";
import authmiddleware from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authRoleMiddleware.js";
import {
  CancelAppointmentByClientHandle,
  cancelAppointmentByProviderHandle,
  getAllAppointmentClientHandle,
  getAllAppointmentProviderHandle,
} from "../controller/appointmentController.js";
import { readIdValidator } from "../validator/createTimeSlotValidator.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: view and cancel appointments by the client or provider
 */

/**
 * @swagger
 * /appointment/client:
 *   get:
 *     summary: View my appointments (Client)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointments retrieved successfully.
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/appointment'
 *       401:
 *         description: Unauthorized – token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


router.get(
  "/client",
  authmiddleware,
  authorizeRoles("client"),
  getAllAppointmentClientHandle
);

/**
 * @swagger
 * /appointment/provider:
 *   get:
 *     summary: View my appointments (provider)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointments retrieved successfully.
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/appointment'
 *       401:
 *         description: Unauthorized – token missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


router.get(
  "/provider",
  authmiddleware,
  authorizeRoles("provider"),
  getAllAppointmentProviderHandle
);

/**
 * @swagger
 * /appointment/{id}/canceled-by-provider:
 *   patch:
 *     summary: Cancel an appointment by the provider and notify the client
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the appointment to cancel
 *     responses:
 *       200:
 *         description: Appointment successfully cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointment successfully cancelled
 *                 appointment:
 *                   $ref: '#/components/schemas/appointment'
 *       400:
 *         description: Invalid appointment ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Update failed – access denied or already cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


router.patch(
  "/:id/canceled-by-provider",
  readIdValidator,
  authmiddleware,
  authorizeRoles("provider"),
  cancelAppointmentByProviderHandle
);

/**
 * @swagger
 * /appointment/{id}/canceled-by-client:
 *   patch:
 *     summary: Cancel an appointment by the client and notify the provider
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the appointment to cancel
 *     responses:
 *       200:
 *         description: Appointment successfully cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointment successfully cancelled
 *                 appointment:
 *                   $ref: '#/components/schemas/appointment'
 *       400:
 *         description: Invalid appointment ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Update failed – access denied or already cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


router.patch(
  "/:id/canceled-by-client",
  readIdValidator,
  authmiddleware,
  authorizeRoles("client"),
  CancelAppointmentByClientHandle
);

export default router;
