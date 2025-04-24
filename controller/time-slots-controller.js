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
      code: "SERVER_ERROR",
    });
  }
}

export async function getAllTimeSlotHandle(req, res, next) {
  const providerId = req.user.id;
  try {
    const getAllTimeSlotQUery = `SELECT start_time,duration_minutes,is_reserved  FROM time_slots 
                                 WHERE provider_id = $1
                                 ORDER BY start_time `;
    const getAllTimeSlotResult = await query(getAllTimeSlotQUery, [providerId]);
    const result = getAllTimeSlotResult.rows;
    logger.info(
      `get all time slot create by service provider with id: ${providerId}`
    );
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Error get all  time slot for provider: ${providerId}  `);
    return res.status(error.status || 500).json({
      message: error.message || "Server error while get all time slot",
      code: "SERVER_ERROR",
    });
  }
}

export async function deletTimeSlotHandle(req, res, next) {
  const providerId = req.user.id;
  const timeSlotId = req.params.id;
  try {
    const getTimeSlotQuery = `SELECT is_reserved FROM time_slots
                              WHERE id = $1 AND provider_id = $2;`;
    const getTimeSlotResult = await query(getTimeSlotQuery, [
      timeSlotId,
      providerId,
    ]);

    if (getTimeSlotResult.rows.length === 0) {
      return res.status(404).json({ message: "time slot does not exist" });
    }

    const isTimeSlotReserved = getTimeSlotResult.rows[0].is_reserved;
    logger.debug(`get colun is_reserved from time_slots id ${timeSlotId}`);
    if (isTimeSlotReserved) {
      logger.warn(
        `you cannot delete a time slot that has already been booked time slot id ${timeSlotId}`
      );
      return res.status(409).json({
        message: "you cannot delete a time slot that has already been booked",
        code: "TIMESLOT_BOOKED",
      });
    }

    const deleteTimeSlotQuery = `DELETE FROM time_slots
                                 WHERE id = $1 AND provider_id= $2
                                 RETURNING id`;
    const deleteResult = await query(deleteTimeSlotQuery, [
      timeSlotId,
      providerId,
    ]);
    logger.info(
      `time slot ${timeSlotId} deleted Successfully by user ${providerId}`
    );
    return res.status(200).json({ message: "time slot deleted Successfully" });
  } catch (error) {
    logger.error(
      `Error Deleting time slot ${timeSlotId} for user ${providerId} : `,
      error
    );
    return res.status(error.status || 500).json({
      message: error.message || "Server error while delete the time slot",
      code: "SERVER_ERROR",
    });
  }
}

export async function updateTimeSlot(req, res, next) {
  const providerId = req.user.id;
  const timeSlotId = req.params.id;
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

    const updateTimeSlotQuery = `UPDATE time_slots SET start_time=$1,duration_minutes=$2
                                 WHERE id = $3 AND provider_id=$4
                                 RETURNING *`;
    const updtaResult = await query(updateTimeSlotQuery, [
      jsStartTime,
      duration,
      timeSlotId,
      providerId,
    ]);
    if (updtaResult.rows.length === 0) {
      logger.warn(`Update failed: time slot not found or access denied for task ID ${timeSlotId}, user ID ${providerId}`)
      const checkTimeSlotExistenceQuery = 'SELECT id FROM time_slots WHERE id = $1'
      const checkResult = await query(checkTimeSlotExistenceQuery, [timeSlotId])
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: "time slot does not exist" })
      }
    }
    logger.info(`time slot ${timeSlotId} updated Successfully by user ${providerId}`)
    return res.json(updtaResult.rows[0])
  } catch (error) {
    logger.error(`Error Updating time slot ${timeSlotId} for user ${providerId} : `, error)
    return res.status(error.status || 500).json({ message: error.message || "Server error while update the task" })
  }
}
