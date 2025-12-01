/* 
two transports are set up:
   - File Transport for Errors: Logs with 'error' level are written to 'error.log', with file size and rotation settings.
   - File Transport for General Logs: All logs are written to 'app.log', also with file size and rotation settings

Example of workflow during runtime:
- When the application encounters an error, such as a failed database connection, the following occurs:
   1. The application calls `logError('Database connection failed')`.
    2. The logger checks the log level and determines that 'error' meets the criteria.
    3. The message is formatted with the current timestamp, log level, and additional metadata.
    4. The formatted message is sent to  the 'error.log' file.
    5. The message is also sent to the 'app.log' file since it meets the 'info' level criteria.

- This process ensures that critical errors are prominently logged for immediate attention while also maintaining a comprehensive log of all application activities for future reference.
    */
import winston from "winston";
import { fileURLToPath } from 'url';
import path from 'path';

// Destructuring specific utilities from winston.format for easier access
const { combine, timestamp, printf } = winston.format;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDirectory = process.env.LOG_DIR || './logs';
const logDirPath = path.resolve(__dirname, '..', logDirectory);


// custom log format specifies how each log message will appear
const logFormat = printf(({ level, message, statusCode, endpoint, method, stack }) => {
    return `${new Date().toLocaleString()} [${level}]: ${message} | Code: ${statusCode} | Endpoint: ${endpoint} | Method: ${method} | Stack: ${stack}`;
});

// Creating a Winston logger instance
const logger = winston.createLogger({
    // Setting the default log level to 'info'
    level: 'info',

    // Defining the default format for logs
    format: combine(
        timestamp(), // Adds a timestamp to each log
        logFormat    // Applies the custom log format defined earlier
    ),

    // Defining the transports (i.e., where logs will be sent/stored)
    transports: [

        // File transport for error logs
        new winston.transports.File({
            filename: `${logDirPath}/error.log`, 
            level: 'error',                     // Only logs with 'error' level will be written here
            maxsize: 5242880,                   // Maximum file size is 5MB
            maxFiles: 5,                        // Keeps up to 5 rotated log files
            tailable: true                      // Ensures the most recent logs are always in the main file
        }),

        // File transport for general application logs
        new winston.transports.File({
            filename: `${logDirPath}/app.log`,  // File path for general logs
            maxsize: 5242880,                   // Maximum file size is 5MB
            maxFiles: 5,                        // Keeps up to 5 rotated log files
            tailable: true                      // Ensures the most recent logs are always in the main file
        })
    ]
});

export const logError = (message, statusCode, endpoint, method, stack) => {
    logger.error(message, { statusCode, endpoint, method, stack });
};

export const logWarning = (message, statusCode, endpoint, method, stack='') => {
    logger.warn(message, { statusCode, endpoint, method, stack });
};

export const logInfo = (message, statusCode, endpoint, method, stack='') => {
    logger.info(message, { statusCode, endpoint, method, stack });
};

