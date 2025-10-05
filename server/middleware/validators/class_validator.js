import {custum_joi as joi, dynamic_validator} from "../dynamic_validator_middleware.js";


// Base schema definition
const base_class_Schema = {
  name: joi.string(),
  description: joi.string().allow(''),
  private_coaching: joi.boolean(),
};

// Schema for creating classes (all required fields)
const create_class_Schema = joi.object({
  name: base_class_Schema.name.required(),
  description: base_class_Schema.description.required(),
  private_coaching: base_class_Schema.private_coaching.required(),
}).required();



// Schema for updating classes (all fields optional but one must be present)
const update_class_Schema = joi.object({
  name: base_class_Schema.name,
  description: base_class_Schema.description,
  private_coaching: base_class_Schema.private_coaching,
});

// Schema for class ID validation
const class_id_Schema = joi.object({
    id : joi.number().integer().required(),
}).required();

const delete_class_validator = dynamic_validator([null, class_id_Schema]);

const create_class_validator = dynamic_validator([create_class_Schema]);

const update_class_validator = dynamic_validator([update_class_Schema, class_id_Schema]);

export default {
  create_class_validator,
  update_class_validator,
  delete_class_validator,
};