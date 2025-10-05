import {custum_joi as joi, dynamic_validator} from "../dynamic_validator_middleware.js";

const category_schema = joi.object({
    name:joi.string().min(3).max(50).required(),
}).required();

const image_schema = {
    name: joi.string().min(3).max(50),
    description: joi.string().max(500),
}

const add_image_schema = joi.object({
    name: image_schema.name.required(),
    description: image_schema.description,
}).required();

const update_image_schema = joi.object(image_schema);


const id_schema_base = {
    id: joi.number().integer().required(),
}

const image_category_ids_schema = joi.object({
    category_id: id_schema_base.id,
    image_id: id_schema_base.id,
}).required();

const category_id_schema = joi.object({
    category_id: id_schema_base.id
}).required();

// declare the validators for the routes
const add_category_validator = dynamic_validator([category_schema]);
const update_category_validator = dynamic_validator([category_schema, category_id_schema]);
const add_image_validator = dynamic_validator([add_image_schema, category_id_schema]);
const update_image_validator = dynamic_validator([update_image_schema, image_category_ids_schema]);
const delete_category_validator = dynamic_validator([null, category_id_schema]);
const delete_image_validator = dynamic_validator([null, image_category_ids_schema]);

export default{
    add_category_validator,
    update_category_validator,
    add_image_validator,
    update_image_validator,
    delete_image_validator,
    delete_category_validator,
}