import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";
import {
  findExistingAppointmentForClientModel,
  findExistingAppointmentForProviderModel,
  getAllAppointmentClientModel,
  getAllAppointmentProviderModel,
  updateApointmentStatusByProviderModel,
  updateAppointmentStatusByClientModel,
} from "../models/appointmentModel.js";
import { pool } from "../config/db.js";
import { updateTimeSlotReservationModel } from "../models/timeSlotModel.js";

export async function getAllAppointmentClient(clientId) {
  if (!clientId) {
    logger.warn("Client ID is missing from request user.");
    throw new AppError("Client ID is required.", 400);
  }
  const tabAppointment = await getAllAppointmentClientModel(clientId);
  return tabAppointment;
}

export async function getAllAppointmentProvider(providerId) {
  if (!providerId) {
    logger.warn("provider ID is missing from request user.");
    throw new AppError("provider ID is required.", 400);
  }
  const tabAppointment = await getAllAppointmentProviderModel(providerId);
  return tabAppointment;
}

export async function cancelAppointmentByProvider({
  providerId,
  appointmentId,
  io,
}) {
  if (!providerId) {
    logger.warn("provider ID is missing from request .");
    throw new AppError("provider ID is required.", 400);
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // 🔐 query that Locks the row to avoid race conditions
    const appointment = await findExistingAppointmentForProviderModel(client, {
      providerId,
      appointmentId,
    });

    logger.info(
      `Checking existence of appointment ${appointmentId} on database`
    );

    if (!appointment) {
      logger.warn(`No appointment found with ID ${appointmentId}`);
      throw new AppError("Appointment not found.", 404);
    }

    const associatedTimeSlotId = appointment.time_slot_id;
    const clientId = appointment.client_id;
    //Update appointment status
    const updatedAppointment = await updateApointmentStatusByProviderModel(
      client,
      {
        providerId,
        appointmentId,
      }
    );
    logger.info(
      `appointment ${appointmentId} updated Successfully by provider ${providerId}`
    );
    const updateAssociatedTimeSlot = await updateTimeSlotReservationModel(
      client,
      { timeSlotId: associatedTimeSlotId, providerId, reservedStatus: false }
    );
    logger.info(
      `time slot status ${associatedTimeSlotId} updated Successfully by provider ${providerId}`
    );
    await client.query("COMMIT");
    //  Notification au provider et client
    io.to(providerId).emit("appointment_cancelled", {
      message: "The appointment has been cancelled ",
      appointmentId,
    });
    io.to(clientId).emit("appointment_cancelled", {
      message: "The appointment has been cancelled by the provider",
      appointmentId,
    });
    return {
      message: "Appointment successfully cancelled.",
      appointment: updatedAppointment,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(
      `Error while canceled appointment ${appointmentId} by provider ${providerId}:`,
      error
    );
    throw error;
  }
}

export async function cancelAppointmentByClient({
  clientID,
  appointmentId,
  io,
}) {
  if (!clientID) {
    logger.warn("Client ID is missing.");
    throw new AppError("Client ID is required.", 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const appointment = await findExistingAppointmentForClientModel(client, {
      clientID,
      appointmentId,
    });

    if (!appointment) {
      logger.warn(`No appointment found with ID ${appointmentId}`);
      throw new AppError("Appointment not found.", 404);
    }

    const associatedTimeSlotId = appointment.time_slot_id;
    const providerId = appointment.provider_id;

    const updatedAppointment = await updateAppointmentStatusByClientModel(
      client,
      {
        clientID,
        appointmentId,
      }
    );

    await updateTimeSlotReservationModel(client, {
      timeSlotId: associatedTimeSlotId,
      providerId,
      reservedStatus: false,
    });

    await client.query("COMMIT");
    logger.info(
      `appointment ${appointmentId} updated Successfully by client ${clientID}`
    );

    io.to(providerId).emit("appointment_cancelled", {
      message: "The appointment has been cancelled by the client.",
      appointmentId,
    });

    io.to(clientID).emit("appointment_cancelled", {
      message: "The appointment has been cancelled.",
      appointmentId,
    });

    return updatedAppointment;
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(
      `Transaction failed: cancelling appointment ${appointmentId}`,
      error
    );
    throw error;
  } finally {
    client.release();
  }
}
