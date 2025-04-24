import { query } from "../config/db.js";
import { convertDateToJs } from "../utils/convert-date.js";
import logger from "../utils/logger.js";

export async function createTimeSlotHandle(req, res, next) {
  const providerId = req.user.id;
  const { startTime, duration } = req.body;
  try {
    const jsStartTime = convertDateToJs(startTime);

    const conflictCheck = `SELECT id FROM time_slots WHERE provider_id = $1 
                                       AND tstzrange(
                                         start_time, 
                                         start_time + ($2 * interval '1 minute'),
                                         '[]'
                                       ) && tstzrange(
                                         $3::timestamptz,
                                         $3::timestamptz + ($2 * interval '1 minute'),
                                         '[]')`;
    const conflictResult = await query(conflictCheck, [
      providerId,
      duration,
      jsStartTime,
    ]);

    if (conflictResult.rowCount > 0) {
      logger.warn(
        `A time slot already exists for this period for provider:${providerId}`
      );
      return res
        .status(409)
        .json({ message: "A time slot already exists for this period" });
    }

    const timeSlotInsertQuery = `INSERT INTO time_slots (provider_id,start_time,duration_minutes)
                            VALUES ($1,$2::timestamptz,$3)
                            RETURNING *`;
    const result = await query(timeSlotInsertQuery, [
      providerId,
      jsStartTime,
      duration,
    ]);
    const newTimeSlot = result.rows[0];
    logger.info(
      `time slot created Successfully by the provider ${providerId} : ${newTimeSlot.id}`
    );
    return res.status(201).json(newTimeSlot);
  } catch (error) {
    logger.error(
      `Error creating time slot for provider: ${providerId} `,
      error
    );
    return res.status(error.status || 500).json({
      message: error.message || "Server error while creating the time slot",
    });
  }
}

export async function getAllTimeSlotHandle(req, res, next) {
  const providerId = req.user.id;
  try {
    const getAllTimeSlotQUery = `SELECT start_time,duration_minutes,is_reserved  FROM time_slots 
                                 WHERE provider_id = $1
                                 ORDER BY start_time `;
    const getAllTimeSlotResult = await query(getAllTimeSlotQUery,[providerId])
    const result = getAllTimeSlotResult.rows
    logger.info(`get all time slot create by service provider with id: ${providerId}`)
    res.status(200).json(result)
  } catch (error) {
    logger.error(`Error get all  time slot for provider: ${providerId}  `)
    return res.status(error.status||500).json({message:error.message||"Server error while get all time slot"})
  }
}
