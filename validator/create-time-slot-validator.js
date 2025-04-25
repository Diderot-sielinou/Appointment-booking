import Joi from "joi";

const timeSlotSchema = Joi.object({
  startTime: Joi.string()
    .pattern(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4} ([01][0-9]|2[0-3]):[0-5][0-9]$/
    )
    .required()
    .messages({
      "string.pattern.base": 'Invalid format. Use "DD/MM/YYYY HH:MM"',
      "any.required": "The start time  date is required",
    }),
  duration: Joi.number().integer().positive().required().messages({
    "number.base": "Duration must be a number",
    "number.integer": "Duration must be an integer",
    "number.positive": "Duration must be positive",
    "any.required": "The duration field is required",
  }),
});

export function createTimeSlotValidator(req, res, next) {
  const { error } = timeSlotSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}

const IdSchema = Joi.object({
  id: Joi.string().required(),
});

export const readIdValidator = (req, res, next) => {
  const { error } = IdSchema.validate(req.params);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const datePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

const searchChema = Joi.object({
  fromDate: Joi.string()
    .pattern(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": "fromDate must be in the format JJ/MM/AAAA",
    }),
  providerId: Joi.string().uuid().required().messages({
    "string.guid": "providerId must be a valide UUID ",
  }),
  toDate: Joi.string()
    .pattern(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/)
    .optional()
    .messages({
      "string.pattern.base": "fromDate must be in the format JJ/MM/AAAA",
    }),
});

export const searchTimeSlotValidator = (objet) => {
  const { error } = searchChema.validate(objet);
  if (error) {
    throw new Error(`Validation failed: ${error.details[0].message}`);
  }
};
