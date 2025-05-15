import { query } from "../config/db.js";
import {
  bookedTimeSlot,
  createTimeSlot,
  deleteTimeSlot,
  getAllCreateTimeSlot,
  searchTimeSlot,
  updateTimeSlot,
} from "../services/timeSlotService.js";
import {
  convertDateToJs,
  convertSearchDateToJs,
} from "../utils/convertDate.js";
import logger from "../utils/logger.js";
import { searchTimeSlotValidator } from "../validator/createTimeSlotValidator.js";

export async function createTimeSlotHandle(req, res, next) {
  const providerId = req.user.id;
  const zone = req.headers["x-time-zone"] || "UTC";
  const { startTime, duration } = req.body;
  try {
    const newTimeSlot = await createTimeSlot({
      startTime,
      duration,
      providerId,
      zone,
    });
    logger.info(
      `time slot created Successfully by the provider ${providerId} : ${newTimeSlot.id}`
    );
    return res.status(201).json({
      message: "time slot created Successfully",
      results: newTimeSlot,
    });
  } catch (error) {
    logger.error(
      `Error creating time slot for provider: ${providerId} `,
      error
    );
    next(error);
  }
}

export async function getAllTimeSlotHandle(req, res, next) {
  const providerId = req.user.id;
  try {
    const results = await getAllCreateTimeSlot(providerId);
    logger.info(
      `get all time slot create by service provider with id: ${providerId}`
    );
    res.status(200).json({ message: "successfully", results });
  } catch (error) {
    logger.error(`Error get all  time slot for provider: ${providerId}  `);
    next(error);
  }
}

export async function deleteTimeSlotHandle(req, res, next) {
  const providerId = req.user.id;
  const timeSlotId = req.params.id;
  try {
    const deletedTimeSlot = await deleteTimeSlot({providerId, timeSlotId});
    console.log("gggggggg",deletedTimeSlot.id)

    logger.info(
      `time slot ${timeSlotId} deleted Successfully by user ${providerId}`
    );
    return res.status(200).json({
      message: "time slot deleted Successfully",
      timeSlotId: deletedTimeSlot.id,
    });
  } catch (error) {
    logger.error(
      `Error Deleting time slot ${timeSlotId} for user ${providerId} : `,
      error
    );
    next(error);
  }
}

export async function updateTimeSlotHandle(req, res, next) {
  const providerId = req.user.id;
  const timeSlotId = req.params.id;
  const { startTime, duration } = req.body;
  const zone = req.headers["x-time-zone"] || "UTC";
  try {
    const results = await updateTimeSlot({
      startTime,
      duration,
      providerId,
      timeSlotId,
      zone,
    });
    logger.info(
      `time slot ${timeSlotId} updated Successfully by user ${providerId}`
    );
    return res
      .status(200)
      .json({ 
        message: "successfully updating time slot ", 
        result: results 
      });
  } catch (error) {
    logger.error(
      `Error Updating time slot ${timeSlotId} for user ${providerId} : `,
      error
    );
    next(error);
  }
}

export async function searchTimeSlotHandle(req, res, next) {
  let { providerId, fromDate, toDate } = req.query;
  const zone = req.headers["x-time-zone"] || "UTC";

  try {

    const results = await searchTimeSlot({ providerId, fromDate, toDate, zone })

    logger.info(
      `search time slot for provider ${providerId} at ${fromDate}and ${toDate}`
    );
    res.status(200).json({
      message:"search result of time slot",
      results
    });
  } catch (error) {
    logger.error(
      `error while searching for time slots  for user ${providerId} : `,
      error
    );
    next(error)

  }
}

export async function bookedTimeSlotHandle(req, res, next) {
  const clientId = req.user.id;
  const timeSlotId = req.params.id;
  const io = req.app.get("io");
  try {
    const result = await bookedTimeSlot({
      clientId,
      timeSlotId,
      io,
    });

    return res.status(201).json(result);
  } catch (error) {
    logger.error(
      `error while booked the time slots  for user ${clientId} : `,
      error
    );
    next(error)
   
  }
}


// export async function createTimeSlotHandle(req, res, next) {
//   const providerId = req.user.id;
//   const zone = req.headers['x-time-zone'] || 'UTC';
//   const { startTime, duration } = req.body;
//   try {
//     const jsStartTime = convertDateToJs(startTime,zone);

//     const conflictCheck = `SELECT id FROM time_slots WHERE provider_id = $1
//                                        AND tstzrange(
//                                          start_time,
//                                          start_time + ($2 * interval '1 minute'),
//                                          '[]'
//                                        ) && tstzrange(
//                                          $3::timestamptz,
//                                          $3::timestamptz + ($2 * interval '1 minute'),
//                                          '[]')`;
//     const conflictResult = await query(conflictCheck, [
//       providerId,
//       duration,
//       jsStartTime,
//     ]);

//     if (conflictResult.rowCount > 0) {
//       logger.warn(
//         `A time slot already exists for this period for provider:${providerId}`
//       );
//       return res
//         .status(409)
//         .json({ message: "A time slot already exists for this period" });
//     }

//     const timeSlotInsertQuery = `INSERT INTO time_slots (provider_id,start_time,duration_minutes)
//                             VALUES ($1,$2::timestamptz,$3)
//                             RETURNING *`;
//     const result = await query(timeSlotInsertQuery, [
//       providerId,
//       jsStartTime,
//       duration,
//     ]);
//     const newTimeSlot = result.rows[0];
//     logger.info(
//       `time slot created Successfully by the provider ${providerId} : ${newTimeSlot.id}`
//     );
//     return res.status(201).json({message:"time slot created Successfully",results:newTimeSlot});
//   } catch (error) {
//     logger.error(
//       `Error creating time slot for provider: ${providerId} `,
//       error
//     );
//     return res.status(error.status || 500).json({
//       message: error.message || "Server error while creating the time slot",
//       code: "SERVER_ERROR",
//     });
//   }
// }

// export async function getAllTimeSlotHandle(req, res, next) {
//   const providerId = req.user.id;
//   try {
//     const getAllTimeSlotQUery = `SELECT * FROM time_slots
//                                  WHERE provider_id = $1
//                                  ORDER BY start_time `;
//     const getAllTimeSlotResult = await query(getAllTimeSlotQUery, [providerId]);
//     const results = getAllTimeSlotResult.rows;
//     logger.info(
//       `get all time slot create by service provider with id: ${providerId}`
//     );
//     res.status(200).json({message:"successfully",results});
//   } catch (error) {
//     logger.error(`Error get all  time slot for provider: ${providerId}  `);
//     return res.status(error.status || 500).json({
//       message: error.message || "Server error while get all time slot",
//       code: "SERVER_ERROR",
//     });
//   }
// }

// export async function deleteTimeSlotHandle(req, res, next) {
//   const providerId = req.user.id;
//   const timeSlotId = req.params.id;
//   try {
//     const getTimeSlotQuery = `SELECT is_reserved FROM time_slots
//                               WHERE id = $1 AND provider_id = $2;`;
//     const getTimeSlotResult = await query(getTimeSlotQuery, [
//       timeSlotId,
//       providerId,
//     ]);

//     if (getTimeSlotResult.rows.length === 0) {
//       return res.status(404).json({ message: "time slot does not exist" });
//     }

//     const isTimeSlotReserved = getTimeSlotResult.rows[0].is_reserved;
//     logger.debug(`get colun is_reserved from time_slots id ${timeSlotId}`);
//     if (isTimeSlotReserved) {
//       logger.warn(
//         `you cannot delete a time slot that has already been booked time slot id ${timeSlotId}`
//       );
//       return res.status(409).json({
//         message: "you cannot delete a time slot that has already been booked",
//         code: "TIMESLOT_BOOKED",
//       });
//     }

//     const deleteTimeSlotQuery = `DELETE FROM time_slots
//                                  WHERE id = $1 AND provider_id= $2
//                                  RETURNING id`;
//     const deleteResult = await query(deleteTimeSlotQuery, [
//       timeSlotId,
//       providerId,
//     ]);
//     logger.info(
//       `time slot ${timeSlotId} deleted Successfully by user ${providerId}`
//     );
//     return res.status(200).json({ message: "time slot deleted Successfully" });
//   } catch (error) {
//     logger.error(
//       `Error Deleting time slot ${timeSlotId} for user ${providerId} : `,
//       error
//     );
//     return res.status(error.status || 500).json({
//       message: error.message || "Server error while delete the time slot",
//       code: "SERVER_ERROR",
//     });
//   }
// }



// export async function bookedTimeSlotHandle(req, res, next) {
//   const clientId = req.user.id;
//   const timeSlotId = req.params.id;
//   const io = req.app.get("io");
//   try {
//     const checkTimeSlotQuery = `SELECT * FROM time_slots 
//                                WHERE id=$1`;
//     const checkResult = await query(checkTimeSlotQuery, [timeSlotId]);
//     logger.info(`check if exist time slot ${timeSlotId} on database`);
//     if (checkResult.rows.length === 0) {
//       logger.warn(`no time slot found for id ${timeSlotId}`);
//       return res.status(404).json({ message: "no time slot found" });
//     }

//     const providerId = checkResult.rows[0].provider_id;

//     const timeSlotStatus = checkResult.rows[0].is_reserved;

//     if (timeSlotStatus) {
//       logger.warn(
//         `time slot ${timeSlotId} already booked you can booking again`
//       );
//       return res
//         .status(409)
//         .json({ message: "time slot is already booked you can't book again" });
//     }
//     const createAppointmentQuery = `INSERT INTO appointment (client_id,provider_id,time_slot_id,status)
//                        VALUES ($1,$2,$3,$4)
//                        RETURNING *`;
//     const createAppointmentResult = await query(createAppointmentQuery, [
//       clientId,
//       providerId,
//       timeSlotId,
//       "confirmed",
//     ]);
//     logger.info(
//       `successfully register appointment for client ${clientId} with provider ${providerId}`
//     );
//     const updateTimeSlotQuery = `UPDATE time_slots SET is_reserved = $1
//                                WHERE id=$2 AND provider_id = $3
//                                RETURNING *`;
//     const updateResult = await query(updateTimeSlotQuery, [
//       true,
//       timeSlotId,
//       providerId,
//     ]);

//     if (updateResult.rows.length === 0) {
//       logger.error(
//         `error while updating the reservation status of the time slot ${timeSlotId} created by ${providerId}`
//       );
//     }
//     logger.info(
//       `successfully register appointment for client ${clientId} and updating the reservation status of the time slot ${timeSlotId} `
//     );
//     //  Notification  provider
//     io.to(providerId).emit("time_slot_reserved", {
//       message: "A slot has just been reserved",
//       slotInfo: checkResult.rows,
//     });

//     return res.status(200).json({
//       message:
//         "the reservation of the time slot is successfully carried out you have a new appointment",
//       appointment: createAppointmentResult.rows[0],
//     });
//   } catch (error) {
//     logger.error(
//       `error while booked the time slots  for user ${clientId} : `,
//       error
//     );
//     return res.status(error.status || 500).json({
//       message: error.message || "Server error  while booking the time slots",
//     });
//   }
// }


// export async function bookedTimeSlotHandle(req, res, next) {
//   const clientId = req.user.id;
//   const timeSlotId = req.params.id;
//   const io = req.app.get("io");
//   try {
//     const checkTimeSlotQuery = `SELECT * FROM time_slots 
//                                WHERE id=$1`;
//     const checkResult = await query(checkTimeSlotQuery, [timeSlotId]);
//     logger.info(`check if exist time slot ${timeSlotId} on database`);
//     if (checkResult.rows.length === 0) {
//       logger.warn(`no time slot found for id ${timeSlotId}`);
//       return res.status(404).json({ message: "no time slot found" });
//     }

//     const providerId = checkResult.rows[0].provider_id;

//     const timeSlotStatus = checkResult.rows[0].is_reserved;

//     if (timeSlotStatus) {
//       logger.warn(
//         `time slot ${timeSlotId} already booked you can booking again`
//       );
//       return res
//         .status(409)
//         .json({ message: "time slot is already booked you can't book again" });
//     }
//     const createAppointmentQuery = `INSERT INTO appointment (client_id,provider_id,time_slot_id,status)
//                        VALUES ($1,$2,$3,$4)
//                        RETURNING *`;
//     const createAppointmentResult = await query(createAppointmentQuery, [
//       clientId,
//       providerId,
//       timeSlotId,
//       "confirmed",
//     ]);
//     logger.info(
//       `successfully register appointment for client ${clientId} with provider ${providerId}`
//     );
//     const updateTimeSlotQuery = `UPDATE time_slots SET is_reserved = $1
//                                WHERE id=$2 AND provider_id = $3
//                                RETURNING *`;
//     const updateResult = await query(updateTimeSlotQuery, [
//       true,
//       timeSlotId,
//       providerId,
//     ]);

//     if (updateResult.rows.length === 0) {
//       logger.error(
//         `error while updating the reservation status of the time slot ${timeSlotId} created by ${providerId}`
//       );
//     }
//     logger.info(
//       `successfully register appointment for client ${clientId} and updating the reservation status of the time slot ${timeSlotId} `
//     );
//     //  Notification  provider
//     io.to(providerId).emit("time_slot_reserved", {
//       message: "A slot has just been reserved",
//       slotInfo: checkResult.rows,
//     });

//     return res.status(200).json({
//       message:
//         "the reservation of the time slot is successfully carried out you have a new appointment",
//       appointment: createAppointmentResult.rows[0],
//     });
//   } catch (error) {
//     logger.error(
//       `error while booked the time slots  for user ${clientId} : `,
//       error
//     );
//     return res.status(error.status || 500).json({
//       message: error.message || "Server error  while booking the time slots",
//     });
//   }
// }