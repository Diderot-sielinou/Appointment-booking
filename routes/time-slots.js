import express from "express";
const router = express.Router();
import authmiddleware from '../middleware/authmiddleware.js'
import { createTimeSlotHandle, deletTimeSlotHandle, getAllTimeSlotHandle, searchTimeSlotHandle, updateTimeSlot } from "../controller/time-slots-controller.js";
import { createTimeSlotValidator, readIdValidator } from "../validator/create-time-slot-validator.js";

router.post('/create',createTimeSlotValidator,authmiddleware,createTimeSlotHandle)
router.get('/',authmiddleware,getAllTimeSlotHandle)
router.delete('/:id/delete-time-slot',readIdValidator,authmiddleware,deletTimeSlotHandle)
router.put('/:id/update-time-slot',createTimeSlotValidator,readIdValidator,authmiddleware,updateTimeSlot)
router.get('/search',authmiddleware,searchTimeSlotHandle)

export default router
