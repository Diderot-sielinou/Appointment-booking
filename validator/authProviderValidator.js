import  Joi  from 'joi';
import AppError from "../utils/AppError.js";

const providerRegisterValidator = Joi.object({
  fullName: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[A-Za-zÀ-ÿ ,.'-]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "The full name must only contain letters and certain special characters.",
    }),

  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.email": "The email address is invalid.",
  }),

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

  phone: Joi.string()
    .pattern(/^\+[0-9]{9,15}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "The phone number is invalid (ex: +237XXXXXXXXX).",
    }),

  adresse: Joi.string().min(3).max(100).optional(),

  work: Joi.string().min(3).max(100).optional(),

  aboutMyself: Joi.string().min(20).max(1000).optional(),
});


export const registerProviderValidate = (req, res, next) => {
  const { error } = providerRegisterValidator.validate(req.body, {
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

export const loginProviderValidator = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((detail) => detail.message);
    throw new AppError(messages, 400);
  }
  next();
};

