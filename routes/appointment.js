import express from "express";
import authmiddleware from "../middleware/authmiddleware.js";
import {
  CancelAppointmentByCientHandle,
  CancelAppointmentByProviderHandle,
  getAllAppointmentClientHandle,
  getAllAppointmentProviderHandle,
} from "../controller/appointmentController.js";
import { readIdValidator } from "../validator/createTimeSlotValidator.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: operation on appointments
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/appointment'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get("/client", authmiddleware, getAllAppointmentClientHandle);

/**
 * @swagger
 * /appointment/provider:
 *   get:
 *     summary: View my appointments (Provider)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/appointment'
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get("/provider", authmiddleware, getAllAppointmentProviderHandle);

/**
 * @swagger
 * /appointment/{id}/canceled-by-provider:
 *   patch:
 *     summary: "Cancel an appointment by the provider and send a notification"
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
 *         description: "ID of the appointment"
 *     responses:
 *       "200":
 *         description: "Appointment successfully cancelled"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment successfully cancelled"
 *                 appointment:
 *                   $ref: '#/components/schemas/appointment'
 *       "400":
 *         description: "Invalid ID format."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "409":
 *         description: "Update failed: access denied for appointment."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "401":
 *         description: "Unauthorized."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       "500":
 *         description: "Server error."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */



router.patch(
  "/:id/canceled-by-provider",
  readIdValidator,
  authmiddleware,
  CancelAppointmentByProviderHandle
);


/**
 * @swagger
 * /appointment/{id}/canceled-by-client:
 *   patch:
 *     summary: "Cancel an appointment by the client and send a notification"
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "ID of the appointment"
 *     responses:
 *       200:
 *         description: "Appointment successfully cancelled"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointment successfully cancelled
 *                 appointment: { $ref: '#/components/schemas/appointment' }
 *       400:
 *         description: "Invalid ID format"
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: "Update failed: access denied for appointment"
 *         content:
 *           application/json:
 *             schema: {$ref: '#/components/schemas/Error'}
 *       401:
 *         description: "Unauthorized"
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: "Server error"
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */


router.patch(
  "/:id/canceled-by-client",
  readIdValidator,
  authmiddleware,
  CancelAppointmentByCientHandle
);

export default router;
