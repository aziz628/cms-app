import {logError,} from '../services/logging_service.js';
let default_error = {
        status: 500,
        message: "Internal Server Error",
        code: "INTERNAL_ERROR"
    }
/**
 * Global error handler middleware
 * Catches all errors thrown in the application and formats them for client response
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} _next - Express next function
 */

const errorHandler = (err, req, res, _next) => {
    // Log error details for server-side debugging
    if(process.env.NODE_ENV == "development" ) {
        console.error('Error:', err);
    }

    let error = null;
    // Handle custom AppError
    if (err.name === 'AppError') {
        error = {
            status: err.statusCode,
            message: err.message,
            code: err.code || err.message.toUpperCase().replace(/\s+/g, '_')
        };
    }

    // Handle network/dns errors
    else if (NETWORK_ERRORS.includes(err.code)) {
        error = {
            status: 503,
            message: "Service temporarily unavailable. Please try again later.",
            code: "SERVICE_UNAVAILABLE"
        };
    }
    

    // Find registered  error response
    else {
        const mappedError = errorMapping[err.code] || errorMapping[err.name] || errorMapping[err.message];
        if (mappedError) {
            error = {
                status: mappedError.status,
                message: mappedError.message,
                code: mappedError.code
            };
        }
    }
    // in case of no code in the error

    error = error || default_error;
    
    // Log the error using logging service
    if(error.status >= 500){
        logError(err.message, error.status, req.originalUrl, req.method, err.stack);
    }
    // Send consistent error response structure
    res.status(error.status).json({
        message: error.message,
        code: error?.code || default_error.code,
    });
};

// If the server can't reach an external dependency like  a database timeout or API failure,
// it can still respond to the client with a 503 status .
// This informs the user that the issue is temporary and server-related,  
// to keep answer user friendly instead of mentioning dependency we just say temporarily unavailable.

// Define network-related error codes
const NETWORK_ERRORS = [
    "ENOTFOUND", // DNS failures
    "ECONNREFUSED", // Service offline
    "ETIMEDOUT", // Timeout
    "ECONNRESET", // Connection dropped
];

// Default error response for unmapped errors
const errorMapping = {
    // Token/Auth Errors - Most common in our CMS
    TokenExpiredError: { status: 401, message: "Your session has expired. Please log in again.", code: "TOKEN_EXPIRED" },
    JsonWebTokenError: { status: 401, message: "Invalid token. Please log in again.", code: "INVALID_TOKEN" },
    
    // Basic validation
    SyntaxError: { status: 400, message: "Invalid request format", code: "INVALID_FORMAT" },

    // File upload errors
    LIMIT_UNEXPECTED_FILE: { status: 400, message: "Unexpected file field in upload", code: "UNEXPECTED_FILE_FIELD" },
    LIMIT_FILE_COUNT: { status: 413, message: "Too many files uploaded", code: "TOO_MANY_FILES" },
    LIMIT_FILE_SIZE: { status: 413, message: "Uploaded file is too large", code: "FILE_TOO_LARGE" },
    
    // File system - Just the essential one
    ENOENT: { status: 404, message: "Resource not found", code: "NOT_FOUND" },
    
    // database constraint (custom SQLite error message)
    "SQLITE_CONSTRAINT: UNIQUE constraint failed: gallery_category.name": { status: 400, message: "Category name must be unique", code: "DUPLICATE_CATEGORY_NAME" },    
    
    // db errors
    SequelizeUniqueConstraintError: { status: 400, message: "Resource already exists", code: "RESOURCE_EXISTS" },
};

export default errorHandler;
