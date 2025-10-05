import Joi from "joi";

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
// this order explaiend by the body schemas being the most used one and to avoid unnessacy null
// and the param schema must be validated  before the body 
 const dynamic_validator = ([bodySchema = null, paramsSchema = null, querySchema = null] = []) =>
    (req, res, next) => {
        const schemas = [paramsSchema, bodySchema, querySchema]; // Validate params first
        const targets = [req.params, req.body, req.query];

        for (let i = 0; i < schemas.length; i++) {
            if (!schemas[i]) continue; // Skip if no schema provided
            const { error, value } = schemas[i].validate(targets[i], {
                abortEarly: false,
                stripUnknown: true,
            });
            if (error) {
                const err_message = error.details[0].message
                // Log the error details in development mode
                if (process.env.NODE_ENV === "development") {
                    console.log("all errors", error.details, "\n\n", "error message is ", err_message);
                }
                // Return the first error message
                return res.status(400).json({ message: err_message, code: "VALIDATION_ERROR" });
            }

            targets[i] = value; // Update validated data
        }

        // Assign validated data back to request
        [req.params, req.body, req.query] = targets;

        next();
    };
export  {
    dynamic_validator,
    custum_joi
};