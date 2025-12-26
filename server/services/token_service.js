import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET 
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET


/**
 * Generates access and refresh tokens for an admin user.
 * @returns {Object} An object containing the access and refresh tokens.
 * @param {string} access_token_lifespan - The lifespan of the access token (default is '15m' for 15 minutes).
 * @param {string} refresh_token_lifespan - The lifespan of the refresh token (default is '7d' for 7 days).
 * @param {string} username - The username of the admin user (default is 'admin').
 * @param {string} session_id - The session ID to be included in the token payload.
 * if u want to set lifespan in seconds for testing use 1 as integer for 1 second
 * The tokens are signed with the user role 'admin' and do not include a user ID.
 * The access token is used for authentication in protected routes,
 */

function generateTokens({access_token_lifespan='15m', refresh_token_lifespan='7d',username='admin',session_id}={}) {
  if (typeof session_id === 'undefined') {
    throw new Error('Session ID is required for token generation');
  }
  // save session_id in the payload
  const payload = { username, session_id };

  const access_token = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: access_token_lifespan });
  const refresh_token = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: refresh_token_lifespan });
  
  return { access_token, refresh_token };
}

/**
 * Sets the access and refresh tokens in cookies.
 * @param {Object} res - The response object from the Express.js server.
 * @param {string} access_token - The access token to be set in the cookie.
 * @param {string} refresh_token - The refresh token to be set in the cookie.
 * The cookies are set with httpOnly and secure flags based on the environment.
 */

function set_tokens(res, access_token, refresh_token) {
  // determine if in production 
  const isProduction = process.env.NODE_ENV === 'production';

  // set tokens in cookies with httpOnly and secure flags
  res.cookie('access_token', access_token, { 
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' 
  });
  res.cookie('refresh_token', refresh_token, { 
    httpOnly: true, // not accessible via client-side JS
    secure: isProduction,
    sameSite: 'strict' // prevent CSRF
  });
}

/**
 * Clears the access and refresh tokens from cookies.
 * 
 * The clearing process do override the cookies with  expired date to cause them to be removed
 * and empty values for less data transfer over network
 * 
 * @param {Object} res - The response object from the Express.js server.
 * This function is typically called when a user logs out to remove their session tokens.
 */
function clear_tokens(res) {
  // clear tokens from cookies
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
}
export { generateTokens, set_tokens, clear_tokens }