import express from "express";
const router = express.Router();
import authmiddleware from "../middleware/authmiddleware.js";
import authorizeRoles from "../middleware/authRoleMiddleware.js";
import {
  bookedTimeSlotHandle,
  createTimeSlotHandle,
  deleteTimeSlotHandle,
  getAllTimeSlotHandle,
  searchTimeSlotHandle,
  updateTimeSlotHandle,
} from "../controller/timeSlotsController.js";
import {
  createTimeSlotValidator,
  readIdValidator,
} from "../validator/createTimeSlotValidator.js";

/**
 * @swagger
 * tags:
 *   name: time_slots
 *   description: Different operations that can be carried out during time slots.
 */

/**
 * @swagger
 * /time-slots/create:
 *   post:
 *     summary: Add an available time slot (provider)
 *     tags: [time_slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-time-zone
 *         schema:
 *           type: string
 *           example: Europe/Paris
 *         required: true
 *         description: Optional. Client timezone (used to convert date to UTC).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startTime, duration]
 *             properties:
 *               startTime:
 *                 type: string
 *                 example: "12/05/2025"
 *                 description: Start date and time in format `DD/MM/YYYY HH:mm`
 *               duration:
 *                 type: integer
 *                 example: 30
 *                 description: Duration of the time slot in minutes
 *     responses:
 *       201:
 *         description: Time slot created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: time slot create successful! }
 *                 results: { $ref: '#/components/schemas/timeSlot' }
 *       400:
 *         description: Validation error (e.g., startTime or duration don't match).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: A time slot already exists for this period.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error while creating the time slot.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

router.post(
  "/create",
  createTimeSlotValidator,
  authmiddleware,
  authorizeRoles("provider"),
  createTimeSlotHandle
);

/**
 * @swagger
 * /time-slots:
 *   get:
 *     summary: Retrieve all time slots for the authenticated provider
 *     tags: [time_slots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of time slots.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time slots retrieved successfully.
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/timeSlot'
 *       500:
 *         description: Server error while retrieving time slots.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get(
  "/",
  authmiddleware,
  authorizeRoles("provider"),
  getAllTimeSlotHandle
);

/**
 * @swagger
 * /time-slots/{id}/delete-time-slot:
 *   delete:
 *     summary: Delete a specific available time slot (provider only)
 *     tags: [time_slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the time slot to delete
 *     responses:
 *       200:
 *         description: Time slot deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time slot deleted successfully.
 *                 timeSlotId:
 *                   type: string
 *                   format: uuid
 *                   example: ea7bce5d-1faa-41be-b47c-6b580ef23f9c
 *       400:
 *         description: Invalid time slot ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized. You must be logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Time slot not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error while deleting the time slot.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


router.delete(
  "/:id/delete-time-slot",
  readIdValidator,
  authmiddleware,
  authorizeRoles("provider"),
  deleteTimeSlotHandle
);

/**
 * @swagger
 * /time-slots/{id}/update-time-slot:
 *   put:
 *     summary: Update a time slot by ID
 *     tags: [time_slots]
 *     description: Allows a service provider to update the start time and/or duration of an existing time slot.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the time slot to update.
 *       - in: header
 *         name: x-time-zone
 *         required: true
 *         schema:
 *           type: string
 *           example: Europe/Paris
 *         description: Time zone of the client. Used to convert the provided local time into UTC.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startTime, duration]
 *             properties:
 *               startTime:
 *                 type: string
 *                 example: "12/05/2025 14:30"
 *                 description: Start date and time in format `DD/MM/YYYY HH:mm` (client local time).
 *               duration:
 *                 type: integer
 *                 example: 30
 *                 description: Duration of the time slot in minutes.
 *     responses:
 *       200:
 *         description: Time slot updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time slot updated successfully.
 *                 result:
 *                   $ref: '#/components/schemas/timeSlot'
 *       400:
 *         description: Validation error or malformed input.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized. The user must be authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Time slot not found or does not belong to the provider.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Time slot overlaps with an existing reservation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error while updating the time slot.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


router.put(
  "/:id/update-time-slot",
  createTimeSlotValidator,
  readIdValidator,
  authmiddleware,
  authorizeRoles("provider"),
  updateTimeSlotHandle
);

/**
 * @swagger
 * /time-slots/search:
 *   get:
 *     summary: Search available time slots by provider
 *     tags: [time_slots]
 *     description: Retrieve available time slots for a specific provider within an optional date range.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: providerId
 *         required: true
 *         description: UUID of the service provider.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 60c72b2f-5f1b-2c00-1cf9-d1234567890a
 *       - in: query
 *         name: fromDate
 *         required: true
 *         description: Start date for the search range (inclusive), format `YYYY-MM-DD`.
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-05"
 *       - in: query
 *         name: toDate
 *         required: false
 *         description: End date for the search range (inclusive), format `YYYY-MM-DD`.
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-07"
 *     responses:
 *       200:
 *         description: Time slots retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Search result of time slots.
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/timeSlot'
 *       400:
 *         description: Invalid or missing parameters (e.g., providerId format).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized. Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error while searching for time slots.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


router.get(
  "/search",
  authmiddleware,
  authorizeRoles("provider", "client"),
  searchTimeSlotHandle
);

/**
 * @swagger
 * /time-slots/booked/{id}:
 *   get:
 *     summary: Book a specific time slot
 *     tags: [time_slots]
 *     description: Reserves a time slot by its ID if it's available, and sends a notification to the provider.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the time slot to book.
 *     responses:
 *       200:
 *         description: Time slot booked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Time slot booked successfully.
 *                 appointment:
 *                   $ref: '#/components/schemas/appointment'
 *                 slot:
 *                   $ref: '#/components/schemas/timeSlot'
 *       400:
 *         description: Invalid time slot ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Time slot not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Time slot is already booked.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error while booking the time slot.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post(
  "/booked/:id",
  readIdValidator,
  authmiddleware,
  authorizeRoles("client"),
  bookedTimeSlotHandle
);

export default router;
