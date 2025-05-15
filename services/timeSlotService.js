import {
  checkConflictWithExitingTimeSlot,
  checkExistingTimeSlotModel,
  checkReservationStatusTimeSlotModel,
  createTimeSlotModel,
  deleteTimeSlotModel,
  getAllCreateTimeSlotModel,
  getTimeSlotForUpdateModel,
  searchTimeslotModel,
  UpdateTimeSlotModel,
  updateTimeSlotReservationModel,
} from "../models/timeSlotModel.js";
import {
  convertDateToJs,
  convertSearchDateToJs,
} from "../utils/convertDate.js";
import logger from "../utils/logger.js";
import { searchTimeSlotValidator } from "../validator/createTimeSlotValidator.js";
import AppError from "../utils/AppError.js";
import { pool } from "../config/db.js";
import { createAppointmentModel } from "../models/appointmentModel.js";

export async function createTimeSlot({
  startTime,
  duration,
  providerId,
  zone,
}) {
  const jsStartTime = convertDateToJs(startTime, zone);
  const existingkConflit = await checkConflictWithExitingTimeSlot({
    startTime: jsStartTime,
    duration,
    providerId,
  });

  if (existingkConflit) {
    logger.warn(
      `A time slot already exists for this period for provider:${providerId}`
    );
    throw new AppError("A time slot already exists for this period", 409);
  }

  const newTimeSlot = await createTimeSlotModel({
    startTime: jsStartTime,
    duration,
    providerId,
  });

  return newTimeSlot;
}

export async function getAllCreateTimeSlot(providerId) {
  const TabCreateTimeSlot = await getAllCreateTimeSlotModel(providerId);
  return TabCreateTimeSlot;
}

export async function deleteTimeSlot({providerId, timeSlotId}) {
  const existingTimeSlot = await checkExistingTimeSlotModel(timeSlotId);
  if (!existingTimeSlot) {
    logger.warn(`you want to delete no exist time slot ${providerId}`);
    throw new AppError("time slot does not exist", 404);
  }

  const isreserved = await checkReservationStatusTimeSlotModel({
    providerId,
    timeSlotId,
  });
  logger.debug(`get colun is_reserved from time_slots id ${timeSlotId}`);
  if (isreserved) {
    logger.warn(
      `you cannot delete a time slot that has already been booked time slot id ${timeSlotId}`
    );
    throw new AppError(
      "you cannot delete a time slot that has already been booked",
      409
    );
  }

  const TimeSlotDeleted = await deleteTimeSlotModel({timeSlotId, providerId});
  return TimeSlotDeleted;
}

export async function updateTimeSlot({
  startTime,
  duration,
  providerId,
  timeSlotId,
  zone,
}) {
  logger.debug(
    ` Start updateTimeSlot - area: ${zone}, startTime: ${startTime}`
  );
  const jsStartTime = convertDateToJs(startTime, zone);
  logger.debug(`📅 startTime convert to jsDate: ${jsStartTime}`);
  const existingTimeSlot = await checkExistingTimeSlotModel(timeSlotId);
  if (!existingTimeSlot) {
    logger.error(`cannot update a time slot that does not exist ${timeSlotId}`);
    throw new AppError("time slot does not exist", 404);
  }
  const existingConflict = await checkConflictWithExitingTimeSlot({
    providerId,
    startTime: jsStartTime,
    duration,
  });

  if (existingConflict) {
    logger.warn(
      `A time slot already exists for this period for provider:${providerId}`
    );
    throw new AppError("A time slot already exists for this period", 409);
  }

  const updatedTimeSlot = await UpdateTimeSlotModel({
    startTime: jsStartTime,
    duration,
    timeSlotId,
    providerId,
  });

  return updatedTimeSlot;
}

export async function searchTimeSlot({ providerId, fromDate, toDate, zone }) {
  searchTimeSlotValidator({ providerId, fromDate, toDate });
  if (!toDate) {
    toDate = fromDate;
  }
  const [fromDateToIso, toDateToIso] = convertSearchDateToJs(
    fromDate,
    toDate,
    zone
  );

  const timeSlotResult = await searchTimeslotModel({
    providerId,
    fromDateToIso,
    toDateToIso,
    isreserved: false,
  });
  return timeSlotResult;
}

export async function bookedTimeSlot({ clientId, timeSlotId, io }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 🔐 requete qui Verrouiller la ligne pour éviter les races conditions
    const timeSlot = await getTimeSlotForUpdateModel(client, timeSlotId);

    if (!timeSlot) {
      logger.warn(`No time slot found for id ${timeSlotId}`);
      throw new AppError("Time slot not found", 404);
    }
    if (timeSlot.is_reserved) {
      logger.warn(`Time slot ${timeSlotId} is already reserved`);
      throw new AppError("Time slot is already booked", 409);
    }

    const providerId = timeSlot.provider_id;

    const appointment = await createAppointmentModel(client, {
      clientId,
      providerId,
      timeSlotId,
    });

    logger.info(
      `Appointment ${appointment.id} created for client ${clientId} with provider ${providerId}`
    );

    const updatedSlot = await updateTimeSlotReservationModel(client, {
      timeSlotId,
      providerId,
      reservedStatus: true,
    });

    await client.query("COMMIT");
    // 🔔 Notification  provider
    io.to(providerId).emit("time_slot_reserved", {
      message: "A slot has just been reserved",
      slotInfo: timeSlot,
      appointmentId: appointment.id,
    });

    return {
      message: "Time slot booked successfully",
      appointment,
      slot: updatedSlot,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error(
      `Error while booking time slot ${timeSlotId} by user ${clientId}:`,
      err
    );
    throw err;
  } finally {
    client.release();
  }
}
