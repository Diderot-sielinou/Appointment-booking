import Joi from "joi";
import AppError from "../utils/AppError.js";

const clientRegisterValidator = Joi.object({
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .message(
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one symbol"
    )
    .required(),
  repeat_password: Joi.valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  adresse: Joi.string().min(3).max(100).optional(),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{9,15}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Le numéro de téléphone est invalide (ex: +237XXXXXXXXX).",
    }),
});

export const registerClientValidate = (req, res, next) => {
  const { error } = clientRegisterValidator.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    throw new AppError(messages, 400);
  }
  next();
};

const loginSchema = Joi.object({
  email: Joi.string().email({ maxDomainSegments: 2 }).required(),
  password: Joi.string().required(),
});

export const loginClientValidator = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((detail) => detail.message);
    throw new AppError(messages, 400);
  }
  next();
};
