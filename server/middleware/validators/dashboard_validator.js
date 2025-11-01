import { custum_joi } from "../dynamic_validator_middleware.js";
import { dynamic_validator } from "../dynamic_validator_middleware.js";

// Schema for pagination
const paginationSchema = custum_joi.object({
    page: custum_joi.number().integer().min(1).max(1000000)
});

const dashboard_validator = dynamic_validator([null,null,paginationSchema]);
export  {
    dashboard_validator
};