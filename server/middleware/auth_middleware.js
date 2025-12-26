import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError.js';
import { generateTokens, set_tokens ,clear_tokens} from '../services/token_service.js';
import { async_handler } from '../utils/async_controller.js';
import { verify_session_id } from '../services/session_store.js';

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
            let decoded = jwt.verify(access_token, JWT_ACCESS_SECRET);
            let session_id = decoded.session_id;
            if (process.env.NODE_ENV === 'development') console.log('Access token valid');

            // compare session ID to stored one
            if (session_id && verify_session_id(session_id)) {
                return next(); // Valid access token and session ID, proceed
            }
            
            // session ID mismatch
            if (process.env.NODE_ENV === 'development') console.log('Session ID mismatch');
            return next(new AppError('Session invalid', 401, 'SESSION_INVALID'));

        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.log('Access token invalid:', error.message);

            // Continue to refresh token verification
        }
    }
    
    // use refresh token if access token is missing or invalid
    if (refresh_token) {
        try {
            let decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET);
            let session_id = decoded.session_id;
            if (process.env.NODE_ENV === 'development') console.log('Refresh token valid');
            
            // check session ID validity
            if (! (session_id && verify_session_id(session_id))) {
                if (process.env.NODE_ENV === 'development') console.log('Session ID mismatch');
                return next(new AppError('Session invalid', 401, 'SESSION_INVALID'));
            }

            // No token rotation on logout route
            if (req.path === '/logout') return next();

            // rotate new tokens keeping the same session ID
            const { access_token:new_access_token, refresh_token:new_refresh_token } = generateTokens({session_id});

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
})

export  { authenticate_session };