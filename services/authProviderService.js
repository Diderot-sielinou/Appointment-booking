import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import registerServiceProviderHandle from "../controller/authProviderController.js";
import {
  createProviderModel,
  findProviderByEmailModel,
  getProviderInfoByEmailModel,
} from "../models/authProviderModel.js";
import AppError from "../utils/AppError.js";

import { promisify } from "node:util";

const HASH_SALT = 10;

export async function registerServiceProvide({
  fullName,
  email,
  password,
  phone,
  adresse,
  work,
  aboutMyself,
}) {
  const existingProvider = await findProviderByEmailModel(email);
  if (existingProvider) {
    logger.warn(
      `Registrationg attempt failed: Email already exists - ${email}`
    );
    throw new AppError("email already use", 409);
  }

  const passwordHash = await bcrypt.hash(password, HASH_SALT);
  const provider = await createProviderModel({
    fullName,
    email,
    password: passwordHash,
    phone,
    adresse,
    work,
    aboutMyself,
  });
  return provider;
}

const sinJwt = promisify(jwt.sign);

export async function loginServiceProvider({ email, password }) {
  const provider = await getProviderInfoByEmailModel(email);
  if (!provider) {
    logger.warn(`Login attempt failed: User not found - ${email}`);
    throw new AppError("Invalid Credentials", 401);
  }

  const isPassswordMatch = await bcrypt.compare(password, provider.password);

  if (!isPassswordMatch) {
    logger.warn(`Login attempt failed: Incorrect password - ${email}`);
    throw new AppError("Invalid password", 401);
  }

  const payload = {
    user: {
      id: provider.id,
      email: provider.email,
      role: "provider",
    },
  };

  let token;
  try {
    token = await sinJwt(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (error) {
    logger.error(`Error generating JWT for ${email}: `, error);
    throw new AppError("Error generating authentication toke", 500);
  }

  return {
    token,
    provider: {
      id: provider.id,
      fullName: provider.full_name,
      email: provider.email,
      adresse: provider.adresse,
      work: provider.work,
      aboutMyself: provider.about_myself,
      phone: provider.phone,
    },
  };
}
