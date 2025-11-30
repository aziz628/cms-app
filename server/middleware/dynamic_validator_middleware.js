import Joi from "joi";
import { logWarning } from "../services/logging_service.js";
 const custum_joi = Joi.defaults((schema) =>
    schema.messages({
        "any.required": "{#label} is required",
        "string.empty": "{#label} cannot be empty",
        "string.min": "{#label} must be at least {#limit} chars",
        "number.min": "{#label} must be ≥ {#limit}",
        "object.min": "At least one field must be provided for update",
        "object.atLeastOne": "At least one field or an image must be provided for update", // Add this line
    }),
);

/** Dynamic validator middleware for Express routes.
 * schema parameter order is by usage (body is most used)
 * @param {Array} [schemas=[]] - An array containing optional Joi schemas for body, params, and query validation.
 * @param {Joi.ObjectSchema} [schemas[0]=null] - Joi schema for request body validation.
 * @param {Joi.ObjectSchema} [schemas[1]=null] - Joi schema for request params validation.
 * @param {Joi.ObjectSchema} [schemas[2]=null] - Joi schema for request query validation.
 * @returns {Function} Express middleware function for dynamic validation.
 */
const dynamic_validator = ([bodySchema = null, paramsSchema = null, querySchema = null] = []) =>
    (req, res, next) => {
        const schemas = [paramsSchema, bodySchema, querySchema]; // Validate params first to fail fast
        const targets = [req.params, req.body, req.query];

        for (let i = 0; i < schemas.length; i++) {
            if (!schemas[i]) continue; // Skip if no schema provided
            const { error, value } = schemas[i].validate(targets[i], {
                abortEarly: false,
                stripUnknown: true,// extremely important , we are using the object keys in sql query
            });
            if (error) {
                const err_message = error.details[0].message
                // Log the error details in development mode
                if (process.env.NODE_ENV === "development") {
                    console.log("all errors", error.details, "\n\n", "error message is ", err_message);
                }
                // (message, statusCode, endpoint, method, stack)
                logWarning(`Validation error: ${err_message}`, 400, req.originalUrl, req.method);
                
                // Return the first error message
                return res.status(400).json({ message: err_message, code: "VALIDATION_ERROR" });
            }

            targets[i] = value; // Update validated data
        }
        

        // Assign validated data back to request
        [req.params, req.body, req.query] = targets;
        
        // DEFENSE IN DEPTH: Verify body keys match schema
        if (bodySchema && req.body && Object.keys(req.body).length > 0) {
            validateAllowedBodyKeys(bodySchema, req.body);
        }

        next();
    };

// Validate allowed keys in the request body against the Joi schema
function validateAllowedBodyKeys(bodySchema, body) {
    const schemaKeys = new Set(Object.keys(bodySchema.describe().keys));

    for (const key of Object.keys(body)) {
        if (!schemaKeys.has(key)) {
            throw new Error(`Security: Unexpected key "${key}" in request body`);
        }
    }
}

export  {
    dynamic_validator,
    custum_joi
};