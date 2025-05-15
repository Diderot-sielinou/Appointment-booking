import { loginClient, registerClient } from "../services/authClientService.js";
import logger from "../utils/logger.js";

import { query } from "../config/db.js";
// import logger from "../utils/logger.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function registerClientHandle(req, res, next) {
  const { firstName, lastName, email, password, adresse, phone } = req.body;
  try {
    const newClient = await registerClient({
      firstName,
      lastName,
      email,
      password,
      adresse,
      phone,
    });
    logger.info(`client registered successfully: ${newClient.id}`);

    return res.status(201).json({
      message: "client registered successfully",
      clientId: {
        id: newClient.id,
      },
    });
  } catch (error) {
    logger.error(`Error during client registration for ${email}: `, error);
    next(error);
  }
}

export async function loginClientHandle(req, res, next) {
  const { email, password } = req.body;
  try {
    const client = await loginClient({ email, password });
    logger.info(`client logged in successfully: ${email} (ID: ${client.id})`);
    res.status(200).json({
      message: "Login Successfull!",
      ...client,
    });
  } catch (error) {
    logger.error(`Error during login process for ${email}: `, error);
    next(error)
  }
}
