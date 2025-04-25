import express from 'express'
import authmiddleware from "../middleware/authmiddleware.js";
import { getAllAppointmentClient, getAllAppointmentProvider } from '../controller/appointment-controller.js';
const router =express.Router()

router.get('/client',authmiddleware,getAllAppointmentClient)
router.get('/provider',authmiddleware,getAllAppointmentProvider)


export default router