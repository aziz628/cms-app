/**
 * Custom application error class
 * Simple error extension with status code for API responses
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Optional error code for client identification
   */
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export  default AppError;