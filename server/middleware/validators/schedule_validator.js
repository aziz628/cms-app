import {dynamic_validator,custum_joi as joi} from "../dynamic_validator_middleware.js";

const days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Base Schema for session validation
const session_Schema_base = {
    // Class ID is a  number or can be server
        class_id: joi.number().integer(),
        start_time: joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).messages({
            'string.pattern.base': '"start_time" must be in 24-hour format (HH:MM)'
        }), // 24-hour format HH:MM
        end_time: joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).messages({
            'string.pattern.base': '"end_time" must be in 24-hour format (HH:MM)'
        }), // 24-hour format HH:MM
        day_of_week: joi.string().valid(...days_of_week)
    }

// Schema for create session validation
const create_session_Schema = joi.object({
    class_id: session_Schema_base.class_id.required(),
    start_time: session_Schema_base.start_time.required(),
    end_time: session_Schema_base.end_time.required(),
    day_of_week: session_Schema_base.day_of_week.required()
}).required();

// Schema for update session validation
const update_session_Schema = joi.object({
    class_id: session_Schema_base.class_id,
    start_time: session_Schema_base.start_time,
    end_time: session_Schema_base.end_time,
    day_of_week: session_Schema_base.day_of_week
}).min(1).required(); // at least one field must be present

// Schema for session ID validation
const session_id_Schema = joi.object({
    id: joi.number().integer().required()
}).required();

const add_session_validator = dynamic_validator([create_session_Schema]);
const update_session_validator = dynamic_validator([update_session_Schema, session_id_Schema]);
const delete_session_validator = dynamic_validator([null, session_id_Schema]);

export default {
    add_session_validator,
    update_session_validator,
    delete_session_validator
};