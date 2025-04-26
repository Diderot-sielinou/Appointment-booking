import express from 'express'
import authmiddleware from "../middleware/authmiddleware.js";
import {  CancelAppointmentByCientHandle, CancelAppointmentByProviderHandle, getAllAppointmentClientHandle,  getAllAppointmentProviderHandle } from '../controller/appointment-controller.js';
import { readIdValidator } from '../validator/create-time-slot-validator.js';
const router =express.Router()

router.get('/client',authmiddleware,getAllAppointmentClientHandle)
router.get('/provider',authmiddleware,getAllAppointmentProviderHandle)
router.get('/canceled/:id/by-provider',readIdValidator,authmiddleware,CancelAppointmentByProviderHandle)
router.get('/canceled/:id/by-client',readIdValidator,authmiddleware,CancelAppointmentByCientHandle)


export default router