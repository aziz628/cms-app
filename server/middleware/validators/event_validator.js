import {custum_joi as joi ,dynamic_validator } from '../dynamic_validator_middleware.js';
const event_schema = {
    title: joi.string().min(1).max(100),
    description: joi.string().max(500),
    date: joi.number().integer().min(0),
    location: joi.string().min(1).max(100)
}

const add_event_schema = joi.object({
    title: event_schema.title.required(),
    description: event_schema.description.optional(),
    //unix timestamp in seconds
    date: event_schema.date.required(),
    location: event_schema.location.required(),
});

const update_event_schema = joi.object(event_schema);

const event_id_schema = joi.object({
    id: joi.number().integer().required(),
}).required();

const add_event_validator = dynamic_validator([add_event_schema]);
const update_event_validator = dynamic_validator([update_event_schema, event_id_schema]);
const delete_event_validator =  dynamic_validator([null,event_id_schema]);

export default {
    add_event_validator,
    update_event_validator,
    delete_event_validator
};
