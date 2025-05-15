import { query } from "../config/db.js";

export async function findClientByEmailModel(email) {
  const checkClientQuery = `SELECT email FROM clients WHERE email = $1`;
  const checkClientResult = await query(checkClientQuery, [email]);
  return checkClientResult.rows[0];
}

export async function createClientModel({
  firstName,
  lastName,
  email,
  password,
  adresse,
  phone,
}) {
  const insertClientSql = `INSERT INTO clients (first_name, last_name, email, password,adresse,phone) 
  VALUES($1,$2,$3,$4,$5,$6)
  RETURNING id`;
  const newClientResult = await query(insertClientSql, [
    firstName,
    lastName,
    email,
    password,
    adresse,
    phone,
  ]);

  return newClientResult.rows[0];
}

export async function getClientInfoByEmailModel(email) {
  const findClientQuery = `SELECT id,first_name,last_name,email,password,adresse,phone FROM clients WHERE email=$1`;
  const clientResult = await query(findClientQuery, [email]);
  return clientResult.rows[0]
}
