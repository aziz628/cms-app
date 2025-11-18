import { dynamic_validator, custum_joi as joi } from "../dynamic_validator_middleware.js";

const days_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Helper function to validate day format
function validateDayFormat (dayValue) {
  if (!dayValue) return false;

  // Check if it's a range (day1-day2)
  if (dayValue.includes('-')) {
    const [day1, day2] = dayValue.split('-').map(d => d.trim());
    
    // Both parts must be valid days
    if (!days_of_week.includes(day1) || !days_of_week.includes(day2)) {
      return false;
    }
    
    // Days must be different (unique)
    if (day1 === day2) {
      return false;
    }
    
    // Both must be valid
    return true;
  }

  // Single day - must be in days_of_week array
  return days_of_week.includes(dayValue.trim());
}

function validateTime(value,helpers){
 // Parse times
    const [openHour, openMin] = value.open_time.split(':').map(Number);
    const [closeHour, closeMin] = value.close_time.split(':').map(Number);

    // Convert to minutes since midnight
    const openTotal = openHour * 60 + openMin;
    const closeTotal = closeHour * 60 + closeMin;

    if (closeTotal - openTotal < 30) {
        return helpers.error("time.range"); // Unique error code
    }
    return value;
}

// Schema for business hours validation
const business_hour_Schema = {
    day: joi.string().custom((value, helpers) => {
        if (!validateDayFormat(value?.toLowerCase())) {
          // return a custom error message
            return helpers.error("day.format"); // Unique error code
        }
        return value;
    }, "Day format validation"),
    // regex for 24-hour format HH:MM
    open_time: joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    close_time: joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
}


const create_business_hour_schema=joi.object({
  day:business_hour_Schema.day.required(),
  open_time:business_hour_Schema.open_time.required(),
  close_time:business_hour_Schema.close_time.required()
}).required()
.custom(validateTime, "Open and Close time validation")
// localize error messages to prevent joi global templates override
.messages({
    'string.pattern.base': '{#label} must be in HH:MM format'
    ,"day.format": `Invalid day format. Use day name (e.g., 'monday') or range (e.g., 'monday-friday')`
    ,"time.range": 'close_time must be at least 30 minutes after open_time'
});


const update_business_hours_schema=joi.object(business_hour_Schema).min(1).required()
.custom(validateTime, "Open and Close time validation")
.messages({
    'string.pattern.base': '{#label} must be in HH:MM format'
    ,"day.format": `Invalid day format. Use day name (e.g., 'monday') or range (e.g., 'monday-friday')`
    ,"time.range": 'close_time must be at least 30 minutes after open_time'
});


const id_schema = joi.object({
  id: joi.number().integer().required()
})


// general info validation schemas (update only)
const about_summary_Schema = joi.object({
  about_summary: joi.string().min(5).max(500).required()
}).messages({
  'string.empty': '"about_summary" cannot be empty',
  'any.required': '"about_summary" is required'
});

const hero_title_Schema = joi.object({
  hero_title: joi.string().min(5).max(100).required()
}).messages({
  'string.empty': '"hero_title" cannot be empty',
  'any.required': '"hero_title" is required'
});
const hero_subtitle_Schema = joi.object({
  hero_subtitle: joi.string().min(5).max(200).required()
}).messages({
  'string.empty': '"hero_subtitle" cannot be empty',
  'any.required': '"hero_subtitle" is required'
});



// Middleware to validate general info
const create_business_hours_validator = dynamic_validator([create_business_hour_schema]);
const update_business_hours_validator = dynamic_validator([update_business_hours_schema,id_schema])
const delete_business_hour_validator = dynamic_validator([null , id_schema])
const about_summary_validator = dynamic_validator([about_summary_Schema]);
const hero_title_validator = dynamic_validator([hero_title_Schema]);
const hero_subtitle_validator = dynamic_validator([hero_subtitle_Schema]);

export default {
  about_summary_validator,
  create_business_hours_validator,
  update_business_hours_validator,
  delete_business_hour_validator,
  hero_title_validator,
  hero_subtitle_validator,
};

