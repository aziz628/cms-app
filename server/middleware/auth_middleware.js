import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError.js';
import { generateTokens, set_tokens ,clear_tokens} from '../services/token_service.js';
import { async_handler } from '../utils/async_controller.js';

const JWT_ACCESS_SECRET= process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET= process.env.JWT_REFRESH_SECRET;

/**
 * Authenticate user session by verifying tokens in cookies
 * - Verifies access token first
 * - If access token invalid but refresh token valid, rotates tokens
 * - If both tokens invalid, session is expired
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */

const authenticate_session = async_handler ((req, res, next) => {
    // Check if the request has cookies
    const access_token = req.cookies?.access_token; // Access token from cookies
    const refresh_token = req.cookies?.refresh_token; // Refresh token from cookies
    
    // If no tokens at all, user is not authenticated
    if (! (access_token || refresh_token)) {
        if (process.env.NODE_ENV === 'development') {
            console.log('Authentication attempt with no tokens');
        }
        return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    // verify access token
    if (access_token) {
        try {
            jwt.verify(access_token, JWT_ACCESS_SECRET);
            if (process.env.NODE_ENV === 'development') {
                console.log('Access token valid');
            }
            return next(); // Valid access token, proceed
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Access token invalid:', error.message);
            }
            // Continue to refresh token verification
        }
    }
    
    // use refresh token if access token is missing or invalid
    if (refresh_token) {
        try {
            jwt.verify(refresh_token, JWT_REFRESH_SECRET);
            console.log('Refresh token valid');

            // No token rotation on logout route
            if (req.path === '/logout') return next();
            
            // Generate new tokens and rotate
            const { access_token:new_access_token, refresh_token:new_refresh_token } = generateTokens();

            // Set new cookies
            set_tokens(res, new_access_token, new_refresh_token);

            return next();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Refresh token invalid:', error.message);
            }

            // Clear invalid cookies
            clear_tokens(res);
            // Return session expired error 
            return next(new AppError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED'));
        }
    }
    
    // If we got here, both tokens are invalid
    return next(new AppError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED'));
})
export  { authenticate_session };
// /api/admin/classes:304 means that the server is responding with a "304 Not Modified" status code for a request made to the /api/admin/classes endpoint. This status code indicates that the requested resource has not been modified since the last time it was accessed, so the server is telling the client (usually a web browser or an API consumer) that it can use its cached version of the resource instead of downloading it again. This helps to reduce bandwidth usage and improve performance by avoiding unnecessary data transfers.