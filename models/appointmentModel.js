import { query } from "../config/db.js";


export async function createAppointmentModel(client, { clientId, providerId, timeSlotId }) {
  const { rows } = await client.query(
    `INSERT INTO appointment (client_id, provider_id, time_slot_id, status)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [clientId, providerId, timeSlotId, 'confirmed']
  );
  return rows[0];
}

