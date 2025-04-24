import { query } from "../config/db.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function loginServiceProviderHandle(req, res, next) {
  const { email, password } = req.body;
  try {
    const findServiceProviderQuery = `SELECT id,full_name,email,password,adresse,
                                    work,about_myself,phone FROM service_providers
                                    WHERE email=$1`;
    const ServiceProviderResult = await query(findServiceProviderQuery, [email]);
    if (ServiceProviderResult.rowCount === 0) {
      logger.warn(`Login attempt failed: User not found - ${email}`);
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const ServiceProvider = ServiceProviderResult.rows[0];

    const isPassswordMatch = await bcrypt.compare(password, ServiceProvider.password);

    if (!isPassswordMatch) {
      logger.warn(`Login attempt failed: Incorrect password - ${email}`);
      return res.status(401).json({ message: "Invalid password" });
    }

    const payload = {
      user: {
        id: ServiceProvider.id,
        email: ServiceProvider.email,
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
      (err, token) => {
        if (err) {
          logger.error(`Error generating JWT for ${email}: `, err);
          throw new Error("Error generating authentication toke");
        }
        logger.info(
          `ServiceProvider logged in successfully: ${email} (ID: ${ServiceProvider.id})`
        );
        res.json({
          message: "Login Successfull!",
          token: token,
          user: {
            id: ServiceProvider.id,
            fullName: ServiceProvider.full_name,
            email: ServiceProvider.email,
            adresse: ServiceProvider.adresse,
            work: ServiceProvider.work,
            aboutMe:ServiceProvider.about_myself,
            phone: ServiceProvider.phone,
          },
        });
      }
    );
  } catch (error) {
    logger.error(`Error during login process for ${email}: `, error);
    res
      .status(500)
      .json({ message: error.message || "Server error during login" });
  }
}
