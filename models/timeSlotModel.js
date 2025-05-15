import { query } from "../config/db.js";

export async function createTimeSlotModel({ providerId, startTime, duration }) {
  const timeSlotInsertQuery = `INSERT INTO time_slots (provider_id,start_time,duration_minutes)
  VALUES ($1,$2::timestamptz,$3)
  RETURNING *`;
  const result = await query(timeSlotInsertQuery, [
    providerId,
    startTime,
    duration,
  ]);

  return result.rows[0];
}

export async function checkConflictWithExitingTimeSlot({
  providerId,
  startTime,
  duration,
}) {
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
    startTime,
  ]);

  return conflictResult.rows[0];
}

export async function getAllCreateTimeSlotModel(providerId) {
  const getAllTimeSlotQUery = `SELECT * FROM time_slots 
  WHERE provider_id = $1
  ORDER BY start_time `;
  const getAllTimeSlotResult = await query(getAllTimeSlotQUery, [providerId]);
  return getAllTimeSlotResult.rows;
}

export async function deleteTimeSlotModel({providerId, timeSlotId}) {
  const deleteTimeSlotQuery = `DELETE FROM time_slots
  WHERE id = $1 AND provider_id= $2
  RETURNING id`;
  const deleteResult = await query(deleteTimeSlotQuery, [
    timeSlotId,
    providerId,
  ]);
  console.log("deleted",deleteResult.rows[0])

  return deleteResult.rows[0];
}

export async function checkExistingTimeSlotModel(timeSlotId) {
  const checkTimeSlotExistenceQuery = "SELECT id FROM time_slots WHERE id = $1";
  const checkResult = await query(checkTimeSlotExistenceQuery, [timeSlotId]);
  return checkResult.rows[0];
}

export async function checkReservationStatusTimeSlotModel({
  providerId,
  timeSlotId,
}) {
  const getTimeSlotQuery = `SELECT is_reserved FROM time_slots
  WHERE id = $1 AND provider_id = $2;`;
  const getTimeSlotResult = await query(getTimeSlotQuery, [
    timeSlotId,
    providerId,
  ]);
  console.log("id timeSlotId ", timeSlotId, providerId);
  return getTimeSlotResult.rows[0]?.is_reserved;
}

export async function UpdateTimeSlotModel({
  startTime,
  duration,
  timeSlotId,
  providerId,
}) {
  const updateTimeSlotQuery = `UPDATE time_slots SET start_time=$1::timestamptz,duration_minutes=$2
  WHERE id = $3 AND provider_id=$4
  RETURNING *`;
  const updtaResult = await query(updateTimeSlotQuery, [
    startTime,
    duration,
    timeSlotId,
    providerId,
  ]);

  return updtaResult.rows[0];
}

export async function searchTimeslotModel({
  providerId,
  fromDateToIso,
  toDateToIso,
  isreserved,
}) {
  const searchQuery = `SELECT * FROM time_slots 
  WHERE provider_id = $1 AND start_time BETWEEN $2 AND $3 AND is_reserved = $4
  ORDER BY start_time ASC `;
  const result = await query(searchQuery, [
    providerId,
    fromDateToIso,
    toDateToIso,
    isreserved,
  ]);

  return result.rows;
}

export async function getTimeSlotInfoModel(timeSlotId) {
  const checkTimeSlotQuery = `SELECT * FROM time_slots 
                              WHERE id=$1`;
  const checkResult = await query(checkTimeSlotQuery, [timeSlotId]);
  return checkResult.rows[0];
}

export async function getTimeSlotForUpdateModel(client, timeSlotId) {
  const { rows } = await client.query(
    `SELECT * FROM time_slots WHERE id = $1 FOR UPDATE`,
    [timeSlotId]
  );
  return rows[0];
}

export async function updateTimeSlotReservationModel(
  client,
  { timeSlotId, providerId, reservedStatus }
) {
  const { rows } = await client.query(
    `UPDATE time_slots SET is_reserved = $1
     WHERE id = $2 AND provider_id = $3 RETURNING *`,
    [reservedStatus, timeSlotId, providerId]
  );
  return rows[0];
}
