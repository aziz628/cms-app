import { dynamic_validator, custum_joi as joi } from "../dynamic_validator_middleware.js";
const review_schema = {
    author: joi.string().min(2).max(30),
    content: joi.string().min(2).max(50),
    identity: joi.string().valid('member', 'guest').allow(''),
};

const add_review_schema = joi.object({
    author: review_schema.author.required(),
    content: review_schema.content.required(),
    identity: review_schema.identity,
}).required()

const update_review_schema = joi.object(review_schema);

const id_schema = joi.object({
    id: joi.number().integer().required()
}).required()

const add_review_validator = dynamic_validator([add_review_schema]);
const update_review_validator = dynamic_validator([update_review_schema, id_schema]);
const delete_review_validator = dynamic_validator([null, id_schema]);

export default {
    add_review_validator,
    update_review_validator,
    delete_review_validator
};