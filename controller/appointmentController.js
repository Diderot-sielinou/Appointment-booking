import { query } from "../config/db.js";
import {
  cancelAppointmentByClient,
  cancelAppointmentByProvider,
  getAllAppointmentClient,
  getAllAppointmentProvider,
} from "../services/appointmentService.js";
import logger from "../utils/logger.js";

export async function getAllAppointmentClientHandle(req, res, next) {
  const clientId = req.user.id;

  try {
    const results = await getAllAppointmentClient(clientId);
    logger.info(`Successfully retrieved appointments for client ${clientId}`);
    return res.status(200).json({
      message: "Appointments retrieved successfully",
      results,
    });
  } catch (error) {
    logger.error(
      `Error retrieving appointments for client ${clientId}: `,
      error
    );
    next(error);
  }
}

export async function getAllAppointmentProviderHandle(req, res, next) {
  const providerId = req.user.id;
  try {
    const results = await getAllAppointmentProvider(providerId);
    logger.info(
      `Successfully retrieved appointments for provider ${providerId}`
    );
    return res.status(200).json({
      message: "Appointments retrieved successfully",
      results,
    });
  } catch (error) {
    logger.error(
      `Error retrieving appointments for provider ${providerId}: `,
      error
    );
    next(error);
  }
}

export async function cancelAppointmentByProviderHandle(req, res, next) {
  const providerId = req.user.id;
  const appointmentId = req.params.id;
  const io = req.app.get("io");

  try {
    const appointment = await cancelAppointmentByProvider({
      providerId,
      appointmentId,
      io,
    });

    return res.status(200).json({ appointment });
  } catch (error) {
    logger.error(
      `Error Updating appointment ${appointmentId} for provider ${providerId} : `,
      error
    );
    next(error);
  }
}

export async function CancelAppointmentByClientHandle(req, res, next) {
  const clientID = req.user.id;
  const appointmentId = req.params.id;
  const io = req.app.get("io");

  try {
    const appointment = await cancelAppointmentByClient({
      clientID,
      appointmentId,
      io,
    });

    return res.status(200).json({
      message: "Appointment successfully cancelled.",
      appointment,
    });
  } catch (error) {
    logger.error(
      `Error cancelling appointment ${appointmentId} for client ${clientID}:`,
      error
    );
    next(error);
  }
}

