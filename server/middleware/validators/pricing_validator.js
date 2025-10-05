import { dynamic_validator, custum_joi as joi } from "../dynamic_validator_middleware.js";

const periods = ['daily', 'weekly', 'monthly', 'annually'];


// base Schema for pricing plan validation
const pricing_plan_schema = {
    name: joi.string().min(3).trim().max(50),
    // positive float between 1 and 1000000
    description: joi.string().max(255).allow(''),
    price: joi.number().min(1).max(1000000).precision(2),
    period: joi.string().valid(...periods),
};
// feature schema
const add_feature_schema = joi.object({
    feature: joi.string().min(2).max(100).required()
});
const update_feature_schema = joi.object({
        feature: joi.string().min(2).max(100)
    }).required();

// Schema for adding a new pricing plan
const add_pricing_plan_schema = joi.object({
    name: pricing_plan_schema.name.required(),
    price: pricing_plan_schema.price.required(),
    period: pricing_plan_schema.period.required(),
    description: pricing_plan_schema.description,
}).required(); 

// Schema for updating an existing pricing plan
const update_pricing_plan_schema = joi.object({
    name: pricing_plan_schema.name,
    price: pricing_plan_schema.price,
    period: pricing_plan_schema.period,
    description: pricing_plan_schema.description,
}).min(1).required();

// Schema for pricing plan ID validation
const pricing_id_schema = joi.object({
    id: joi.number().integer().required()
    
}).required();

const add_pricing_validator = dynamic_validator([add_pricing_plan_schema]);
const add_feature_validator = dynamic_validator([add_feature_schema, pricing_id_schema]);

const update_pricing_validator = dynamic_validator([update_pricing_plan_schema, pricing_id_schema]);
const update_feature_validator = dynamic_validator([update_feature_schema, pricing_id_schema]);

const delete_feature_validator = dynamic_validator([null, pricing_id_schema]);
const delete_pricing_validator = dynamic_validator([null, pricing_id_schema]);

export default {
    add_pricing_validator,
    add_feature_validator,
    update_feature_validator,
    delete_feature_validator,
    update_pricing_validator,
    delete_pricing_validator
};
