import { query } from "../config/db.js";

export async function createAppointmentModel(
  client,
  { clientId, providerId, timeSlotId }
) {
  const { rows } = await client.query(
    `INSERT INTO appointment (client_id, provider_id, time_slot_id, status)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [clientId, providerId, timeSlotId, "confirmed"]
  );
  return rows[0];
}

export async function getAllAppointmentClientModel(clientId) {
  const getAppointmentQuery = `SELECT * FROM appointment
  WHERE client_id = $1 `;
  const { rows } = await query(getAppointmentQuery, [clientId]);
  return rows;
}

export async function getAllAppointmentProviderModel(providerId) {
  const getAppointmentQuery = `SELECT * FROM appointment
  WHERE provider_id = $1`;
  const { rows } = await query(getAppointmentQuery, [providerId]);
  return rows;
}

export async function findExistingAppointmentForProviderModel(
  client,
  { providerId, appointmentId }
) {
  const checkAppointmentQuery = `SELECT * FROM appointment
                                   WHERE id=$1 AND provider_id = $2  FOR UPDATE`;
  const { rows } = await client.query(checkAppointmentQuery, [
    appointmentId,
    providerId,
  ]);

  return rows[0];
}

export async function updateApointmentStatusByProviderModel(
  client,
  { providerId, appointmentId }
) {
  //Update appointment status
  const updateStatusAppointmentQuery = `UPDATE  appointment SET status =$1
      WHERE  id = $2 AND provider_id = $3
      RETURNING * `;
  const {rows} = await client.query(updateStatusAppointmentQuery, [
    "cancelled_by_provider",
    appointmentId,
    providerId,
  ]);
  return rows[0]
}

export async function findExistingAppointmentForClientModel(client, { clientID, appointmentId }) {
  const queryStr = `
    SELECT * FROM appointment
    WHERE id = $1 AND client_id = $2
    FOR UPDATE
  `;
  const { rows } = await client.query(queryStr, [appointmentId, clientID]);
  return rows[0];
}

export async function updateAppointmentStatusByClientModel(client, { clientID, appointmentId }) {
  const queryStr = `
    UPDATE appointment
    SET status = $1
    WHERE id = $2 AND client_id = $3
    RETURNING *
  `;
  const { rows } = await client.query(queryStr, [
    "cancelled_by_client",
    appointmentId,
    clientID,
  ]);
  return rows[0];
}


