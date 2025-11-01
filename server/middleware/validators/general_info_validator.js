import { dynamic_validator, custum_joi as joi } from "../dynamic_validator_middleware.js";

// Schema for business hours validation
const business_hour_Schema = {
    day: joi.string(),
    // regex for 24-hour format HH:MM
    open_time: joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    close_time: joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
}

const create_business_hour_schema=joi.object({
  day:business_hour_Schema.day.required(),
  open_time:business_hour_Schema.open_time.required(),
  close_time:business_hour_Schema.close_time.required()
}).required().messages({
    'string.pattern.base': '{#label} must be in HH:MM format'
});

const update_business_hours_schema=joi.object(business_hour_Schema).min(1).required().messages({
    'string.pattern.base': '{#label} must be in HH:MM format'
});

const id_schema = joi.object({
  id: joi.number().integer().required()
})
// Main general info validation schema
const about_summary_Schema = joi.object({
  about_summary: joi.string().min(5).max(500).required()
}).messages({
  'string.empty': '"about_summary" cannot be empty',
  'any.required': '"about_summary" is required'
});
// Middleware to validate general info
const about_summary_validator = dynamic_validator([about_summary_Schema]);
const create_business_hours_validator = dynamic_validator([create_business_hour_schema]);
const update_business_hours_validator = dynamic_validator([update_business_hours_schema,id_schema])
const delete_business_hour_validator = dynamic_validator([null , id_schema])
export default {
  about_summary_validator,
  create_business_hours_validator,
  update_business_hours_validator,
  delete_business_hour_validator,
};

