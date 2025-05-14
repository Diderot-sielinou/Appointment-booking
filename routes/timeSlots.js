import express from "express";
const router = express.Router();
import authmiddleware from "../middleware/authmiddleware.js";
import {
  bookedTimeSlotHandle,
  createTimeSlotHandle,
  deletTimeSlotHandle,
  getAllTimeSlotHandle,
  searchTimeSlotHandle,
  updateTimeSlot,
} from "../controller/time-slots-controller.js";
import {
  createTimeSlotValidator,
  readIdValidator,
} from "../validator/createTimeSlotValidator.js";

/**
 * @swagger
 * tags:
 *   name: time slots
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
 *                 format: date-time
 *                 example: "2025-05-12T14:30:00Z"  # ISO format
 *               duration:
 *                 type: number
 *                 example: 30
 *     responses:
 *       201:
 *         description: Time slot created successfully.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/timeSlot' }
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
  createTimeSlotHandle
);

/**
 * @swagger
 * /time-slots:
 *   get:
 *     summary: Get all time slots (provider)
 *     tags: [time_slots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved time slots.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/timeSlot' }
 *       500:
 *         description: Server error while retrieving time slots.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

router.get("/", authmiddleware, getAllTimeSlotHandle);

/**
 * @swagger
 * /time-slots/{id}/delete-time-slot:
 *   delete:
 *     summary: Delete a specific available time slot (service provider)
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
 *         description: ID of the time slot to delete
 *     responses:
 *       200:
 *         description: Time slot deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Time slot deleted successfully." }
 *       400:
 *         description: Invalid time slot ID format.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Time slot not found.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

router.delete(
  "/:id/delete-time-slot",
  readIdValidator,
  authmiddleware,
  deletTimeSlotHandle
);

/**
 * @swagger
 * /time-slots/{id}/update-time-slot:
 *   put:
 *     summary: Update a time slot by ID
 *     tags: [time_slots]
 *     description: Updates an existing time slot belonging to the authenticated provider.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the time slot to update.
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
 *                 format: date-time
 *                 example: "2025-05-12T14:30:00Z"  # ISO format
 *               duration:
 *                 type: number
 *                 example: 30
 *     responses:
 *       200:
 *         description: Time slot updated successfully.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/timeSlot' }
 *       400:
 *         description: Validation error or invalid time slot ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Time slot not found.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

router.put(
  "/:id/update-time-slot",
  createTimeSlotValidator,
  readIdValidator,
  authmiddleware,
  updateTimeSlot
);

/**
 * @swagger
 * /time-slots/search:
 *   get:
 *     summary: Search for available time slots from a specific provider
 *     tags: [time_slots]
 *     description: Search for available time slots from a specific provider based on a date or date range.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: providerId
 *         required: true
 *         description: The provider's ID.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 60c72b2f5f1b2c001cf9d123
 *       - in: query
 *         name: todate
 *         required: false
 *         description: Start date of the filter (inclusive) (format YYYY-MM-DD).
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-05"
 *       - in: query
 *         name: fordate
 *         required: false
 *         description: End date of the filter (inclusive) (format YYYY-MM-DD).
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-07"
 *     responses:
 *       200:
 *         description: Search success.
 *         content:
 *           application/json:
 *             type: array
 *             items: { $ref: '#/components/schemas/timeSlot' }
 *       400:
 *         description: Invalid provider ID format.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

router.get("/search", authmiddleware, searchTimeSlotHandle);

/**
 * @swagger
 * /time-slots/booked/{id}:
 *   get:
 *     summary: Book a specific time slot
 *     tags: [time_slots]
 *     description: Reserve a time slot by ID, if it is free, and send a notification to the provider.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the time slot to retrieve.
 *     responses:
 *       200:
 *         description: The requested time slot.
 *         content:
 *           application/json:
 *             type: array
 *             items: { $ref: '#/components/schemas/timeSlot' }
 *       400:
 *         description: Invalid time slot ID format.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Time slot is already booked.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Time slot not found.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get(
  "/booked/:id",
  readIdValidator,
  authmiddleware,
  bookedTimeSlotHandle
);

export default router;
