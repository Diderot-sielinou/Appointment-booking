import { query } from "../config/db.js";

export async function findProviderByEmailModel(email) {
  const serviceProviderCheckQuery = `SELECT email FROM service_providers WHERE email = $1`;
  const serviceProviderCheckResult = await query(serviceProviderCheckQuery, [
    email,
  ]);
  return serviceProviderCheckResult.rows[0];
}

export async function createProviderModel({
  fullName,
  email,
  password,
  phone,
  adresse,
  work,
  aboutMyself,
}) {
  const insertServiceProviderSQL = `INSERT INTO service_providers (full_name,email,password,adresse,phone,work,about_myself)
  VALUES ($1,$2,$3,$4,$5,$6,$7) 
  RETURNING id`;
  const newServiceProviderResult = await query(insertServiceProviderSQL, [
    fullName,
    email,
    password,
    adresse,
    phone,
    work,
    aboutMyself,
  ]);

  return newServiceProviderResult.rows[0];
}

export async function getProviderInfoByEmailModel(email) {
  const findServiceProviderQuery = `SELECT id,full_name,email,password,adresse,
  work,about_myself,phone FROM service_providers
  WHERE email=$1`;
  const ServiceProviderResult = await query(findServiceProviderQuery, [email]);
  return ServiceProviderResult.rows[0];
}
