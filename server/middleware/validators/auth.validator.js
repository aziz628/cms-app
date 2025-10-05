import { custum_joi , dynamic_validator } from "../dynamic_validator_middleware.js";

const login_schema = custum_joi.object({
    username: custum_joi.string().min(3).max(30).required(),
    password: custum_joi.string().min(8).max(100).required()
});

const password_update_schema = custum_joi.object({
    new_password: custum_joi.string().min(8).max(100).required()
});
const username_update_schema = custum_joi.object({
    new_username: custum_joi.string().min(3).max(30).required()
});
const login_validator = dynamic_validator([login_schema]);
const password_update_validator = dynamic_validator([password_update_schema]);
const username_update_validator = dynamic_validator([username_update_schema]);

export default {
    login_validator,
    username_update_validator,
    password_update_validator
};
