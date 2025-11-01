import { dynamic_validator, custum_joi as joi } from "../dynamic_validator_middleware.js";

// base trainer Schema
const trainer_schema = {
    name: joi.string(),
    speciality: joi.string(),
    certificate: joi.string(),
    years_of_experience: joi.number().integer().min(0),
};

// Schema for adding a new trainer
const add_trainer_schema = joi.object({
    name: trainer_schema.name.required(),
    speciality: trainer_schema.speciality.required(),
    certificate: trainer_schema.certificate.required(),
    years_of_experience: trainer_schema.years_of_experience.required(),
}).required();
// Schema for updating an existing trainer
const update_trainer_schema = joi.object(trainer_schema);

// Schema for trainer ID validation
const trainer_id_schema = joi.object({
    id: joi.number().integer().required()
});

// final validators 
const add_trainer_validator = dynamic_validator([add_trainer_schema]);
const update_trainer_validator = dynamic_validator([update_trainer_schema, trainer_id_schema]);
const delete_trainer_validator = dynamic_validator([null, trainer_id_schema]);

export default{
    add_trainer_validator,
    update_trainer_validator,
    delete_trainer_validator
};
