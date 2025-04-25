import { query } from "../config/db.js";
import logger from "../utils/logger.js";

export async function getAllAppointmentClient(req, res, next) {
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

export async function getAllAppointmentProvider(req, res, next) {
  const providerId= req.user.id;
  if (!providerId) {
    logger.warn("Client ID is missing from request user.");
    return res.status(400).json({ message: "Client ID is required." });
  }
  try {
    const getAppointmentQuery = `SELECT * FROM appointment
                                 WHERE client_id = $1 `;
    const getAllTimeSlotResult = await query(getAppointmentQuery, [providerId]);
    const results = getAllTimeSlotResult.rows;
    logger.info(`Successfully retrieved appointments for client ${providerId}`);
    return res.status(200).json({
      message: "Appointments retrieved successfully",
      results,
    });
  } catch (error) {
    logger.error(
      `Error retrieving appointments for client ${providerId}: `,
      error
    );
    return res.status(error.status || 500).json({
      message: error.message || "Server error while retrieving appointments",
    });
  }
}