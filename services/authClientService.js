import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { promisify } from "node:util";


import {
  createClientModel,
  findClientByEmailModel,
  getClientInfoByEmailModel,
} from "../models/authClientModel.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";

const HASH_SALT = 10;

export async function registerClient({
  firstName,
  lastName,
  email,
  password,
  adresse,
  phone,
}) {
  const existingClient = await findClientByEmailModel(email);
  if (existingClient) {
    logger.warn(
      `Registrationg attempt failed: Email already exists - ${email}`
    );
    throw new AppError("Email already in use", 409);
  }
  const passwordHash = await bcrypt.hash(password, HASH_SALT);
  logger.debug(`Password hashed for email: ${email}`);
  const newClient = await createClientModel({
    firstName,
    lastName,
    email,
    password: passwordHash,
    adresse,
    phone,
  });

  return newClient;
}

const signJwt = promisify(jwt.sign);

export async function loginClient({ email, password }) {
  const client = await getClientInfoByEmailModel(email);
  if (!client) {
    logger.warn(`Login attempt failed: User not found - ${email}`);
    throw new AppError("Invalid Credentials", 401);
  }
  const isPassswordMatch = await bcrypt.compare(password, client.password);
  if (!isPassswordMatch) {
    logger.warn(`Login attempt failed: Incorrect password - ${email}`);
    throw new AppError("Invalid password", 401);
  }
  const payload = {
    user: {
      id: client.id,
      email: client.email,
      role: "client",
    },
  };

  let token;
  try {
    token = await signJwt(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (err) {
    logger.error(`Error generating JWT for ${email}: `, err);
    throw new AppError("Error generating authentication toke", 500);
  }

  return {
    token,
    client: {
      id: client.id,
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      adresse: client.adresse,
      phone: client.phone,
      createdAt: client.created_at,
    },
  };
}
