import express from "express";
const router = express.Router();
import authmiddleware from '../middleware/authmiddleware.js'
import { createTimeSlotHandle } from "../controller/time-slots-controller.js";
import { createTimeSlotValidator } from "../validator/create-time-slot-validator.js";

router.post('/create',createTimeSlotValidator,authmiddleware,createTimeSlotHandle)

export default router
