import {custum_joi as joi ,dynamic_validator} from "../dynamic_validator_middleware.js";

const transformation_schema = {
    name: joi.string(),
    description: joi.string().allow(""),
}
const id_schema = joi.object({
    id: joi.number().integer().required(),
}).required();

const add_transformation_schema = joi.object({
    name: transformation_schema.name.required(),
    description: transformation_schema.description.required(),
}).required();

const update_transformation_schema = joi.object(
    transformation_schema
);

const add_transformation_validator = dynamic_validator([add_transformation_schema])
const update_transformation_validator = dynamic_validator([update_transformation_schema,id_schema])
const delete_transformation_validator = dynamic_validator([null,id_schema]);
export default {
    add_transformation_validator,
    update_transformation_validator,
    delete_transformation_validator
};