import { query } from "../config/db.js";
import logger from "../utils/logger.js";

export async function getAllAppointmentClientHandle(req, res, next) {
  const clientId = req.user.id;
  if (!clientId) {
    logger.warn("Client ID is missing from request user.");
    return res.status(400).json({ message: "Client ID is required." });
  }
  try {
    const getAppointmentQuery = `SELECT * FROM appointment
                                 WHERE client_id = $1 `;
    const getAllTimeSlotResult = await query(getAppointmentQuery, [clientId]);
    const results = getAllTimeSlotResult.rows;
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
    return res.status(error.status || 500).json({
      message: error.message || "Server error while retrieving appointments",
    });
  }
}

export async function getAllAppointmentProviderHandle(req, res, next) {
  const providerId = req.user.id;
  if (!providerId) {
    logger.warn("provider ID is missing from request user.");
    return res.status(400).json({ message: "Client ID is required." });
  }
  try {
    const getAppointmentQuery = `SELECT * FROM appointment
                                 WHERE provider_id = $1 `;
    const getAllTimeSlotResult = await query(getAppointmentQuery, [providerId]);
    const results = getAllTimeSlotResult.rows;
    logger.info(`Successfully retrieved appointments for provider ${providerId}`);
    return res.status(200).json({
      message: "Appointments retrieved successfully",
      results,
    });
  } catch (error) {
    logger.error(
      `Error retrieving appointments for provider ${providerId}: `,
      error
    );
    return res.status(error.status || 500).json({
      message: error.message || "Server error while retrieving appointments",
    });
  }
}

export async function CancelAppointmentByProviderHandle(req, res, next) {
  const providerId = req.user.id;
  const appointmentId = req.params.id;
  if (!providerId) {
    logger.warn("provider ID is missing from request .");
    return res.status(400).json({ message: "Client ID is required." });
  }

  try {
    //check if the appointment exists and concerns the provider
    const checkAppointmentQuery = `SELECT * FROM appointment
                                   WHERE id=$1 AND provider_id = $2`;
    const checkResult = await query(checkAppointmentQuery, [
      appointmentId,
      providerId,
    ]);
    logger.info(
      `Checking existence of appointment ${appointmentId} on database`
    );

    if (checkResult.rows.length === 0) {
      logger.warn(`No appointment found with ID ${appointmentId}`);
      return res.status(404).json({ message: "Appointment not found." });
    }

    const associatedTimeSlotId = checkResult.rows[0].time_slot_id;

    //Update appointment status
    const updateStatusAppointmentQuery = `UPDATE  appointment SET status =$1
                                              WHERE  id=$2 AND provider_id = $3
                                              RETURNING *`;
    const updateResult = await query(updateStatusAppointmentQuery, [
      "cancelled_by_provider",
      appointmentId,
      providerId,
    ]);
    if (updateResult.rows.length === 0) {
      logger.warn(
        `Update failed: access denied for appointment ID ${appointmentId}, provider ID ${providerId}`
      );
      return res
        .status(409)
        .json({ message: "Update failed: access denied for appointment" });
    }

    // Free up the time slot
    const updateAssociatedTimeSlotQuery = `UPDATE time_slots SET is_reserved=$1
                                           WHERE id = $2`;
    await query(updateAssociatedTimeSlotQuery, [false, associatedTimeSlotId]);

    logger.info(
      `appointment ${appointmentId} updated Successfully by provider ${providerId}`
    );
    return res.status(200).json({
      message: "Appointment successfully cancelled.",
      appointment: updateResult.rows[0],
    });
  } catch (error) {
    logger.error(
      `Error Updating appointment ${appointmentId} for provider ${providerId} : `,
      error
    );
    return res.status(error.status || 500).json({
      message:
        error.message || "Server error while cancelling the appointment.",
    });
  }
}

export async function CancelAppointmentByCientHandle(req, res, next) {
  const clientID = req.user.id;
  const appointmentId = req.params.id;
  if (!clientID) {
    logger.warn("client ID is missing from request .");
    return res.status(400).json({ message: "Client ID is required." });
  }

  try {
    //check if the appointment exists and concerns the provider
    const checkAppointmentQuery = `SELECT * FROM appointment
                                   WHERE id=$1 AND client_id = $2`;
    const checkResult = await query(checkAppointmentQuery, [
      appointmentId,
      clientID,
    ]);
    logger.info(
      `Checking existence of appointment ${appointmentId} on database`
    );

    if (checkResult.rows.length === 0) {
      logger.warn(`No appointment found with ID ${appointmentId}`);
      return res.status(404).json({ message: "Appointment not found." });
    }

    const associatedTimeSlotId = checkResult.rows[0].time_slot_id;

    //Update appointment status
    const updateStatusAppointmentQuery = `UPDATE  appointment SET status =$1
                                              WHERE  id=$2 AND client_id = $3
                                              RETURNING *`;
    const updateResult = await query(updateStatusAppointmentQuery, [
      "cancelled_by_client",
      appointmentId,
      clientID,
    ]);
    if (updateResult.rows.length === 0) {
      logger.warn(
        `Update failed: access denied for appointment ID ${appointmentId}, client ID ${clientID}`
      );
      return res
        .status(409)
        .json({ message: "Update failed: access denied for appointment" });
    }

    // Free up the time slot
    const updateAssociatedTimeSlotQuery = `UPDATE time_slots SET is_reserved=$1
                                           WHERE id = $2`;
    await query(updateAssociatedTimeSlotQuery, [false, associatedTimeSlotId]);

    logger.info(
      `appointment ${appointmentId} updated Successfully by client ${clientID}`
    );
    return res.status(200).json({
      message: "Appointment successfully cancelled.",
      appointment: updateResult.rows[0],
    });
  } catch (error) {
    logger.error(
      `Error Updating appointment ${appointmentId} for client ${clientID} : `,
      error
    );
    return res.status(error.status || 500).json({
      message:
        error.message || "Server error while cancelling the appointment.",
    });
  }
}
