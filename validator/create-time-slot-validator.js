import Joi from 'joi'

const timeSlotSchema = Joi.object({
  startTime: Joi.string()
    .pattern(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4} ([01][0-9]|2[0-3]):[0-5][0-9]$/
    )
    .required()
    .messages({
      'string.pattern.base': 'Invalid format. Use "DD/MM/YYYY HH:MM"',
      'any.required': 'The start time  date is required'
    }),
    duration: Joi.number()
  .integer()
  .positive()
  .required()
  .messages({
    'number.base': 'Duration must be a number',
    'number.integer': 'Duration must be an integer',
    'number.positive': 'Duration must be positive',
    'any.required': 'The duration field is required',
  })
});

export function createTimeSlotValidator (req,res,next){
  const {error} = timeSlotSchema.validate(req.body)
  if(error){
    return res.status(400).json({ message: error.details[0].message });
  }
  next()
}

/**
 * INSERT INTO time_slots (provider_id, start_time, duration_minutes)
VALUES (
  'ebc0ff91-3c64-4202-9ff0-1171baf4aabc',
  TO_TIMESTAMP('02/05/2025 14:00', 'DD/MM/YYYY HH24:MI'),
  30
);
 */