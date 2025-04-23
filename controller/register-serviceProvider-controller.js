import { query } from "../config/db.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";

const HASH_SALT = 10;

export default async function registerServiceProviderHandle(req, res, next) {
  const { fullName, email, password, phone, adresse, work, aboutMyself } =
    req.body;
  try {
    const serviceProviderCheckQuery = `SELECT email FROM service_providers WHERE email = $1`;
    const serviceProviderCheckResult = await query(serviceProviderCheckQuery, [
      email,
    ]);
    if (serviceProviderCheckResult.rows.length > 0) {
      logger.warn(
        `Registrationg attempt failed: Email already exists - ${email}`
      );
      res.status(409).json({ message: "email already use" });
    }

    const passwordHash = await bcrypt.hash(password, HASH_SALT);
    const insertServiceProviderSQL = `INSERT INTO service_providers (full_name,email,password,adresse,phone,work,about_myself)
                                      VALUES ($1,$2,$3,$4,$5,$6,$7) 
                                      RETURNING id`;
    const newServiceProviderResult = await query(insertServiceProviderSQL, [
      fullName,
      email,
      passwordHash,
      adresse,
      phone,
      work,
      aboutMyself,
    ]);
    const newServiceProvider = newServiceProviderResult.rows[0];

    logger.info(
      `servive_provider registered successfully:${newServiceProvider.id}`
    );

    return res.status(201).json({
      message: "servive provider registered successfully",
      providerId: {
        id: newServiceProvider.id,
      },
    });
  } catch (error) {
    logger.error(
      `Error during service provider registration for ${email}: `,
      error
    );
    next(error);
  }
}
