import { query } from "../config/db.js";
import {
  loginServiceProvider,
  registerServiceProvide,
} from "../services/authProviderService.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function registerServiceProviderHandle(req, res, next) {
  const { fullName, email, password, phone, adresse, work, aboutMyself } =
    req.body;
  try {
    const newProvider = await registerServiceProvide({
      fullName,
      email,
      password,
      phone,
      adresse,
      work,
      aboutMyself,
    });

    logger.info(`servive_provider registered successfully:${newProvider.id}`);

    return res.status(201).json({
      message: "servive provider registered successfully",
      providerId: {
        id: newProvider.id,
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

export async function loginServiceProviderHandle(req, res, next) {
  const { email, password } = req.body;
  try {
    const provider = await loginServiceProvider({ email, password });

    return res.status(200).json({
      message: "Login Successfull!",
      ...provider,
    });
  } catch (error) {
    logger.error(`Error during login process for ${email}: `, error);
    next(error)

  }
}
