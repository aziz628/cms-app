import auth_service from '../services/auth_service.js';
import {set_tokens,generateTokens, clear_tokens} from '../services/token_service.js';
import { set_new_session_id ,clear_session_id} from '../services/session_store.js';
/**
 * Login with admin credentials
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
 async function login(req, res) {
    const { username , password } = req.body;
    await auth_service.verify_credentials(username, password);

    // Generate new session ID 
    const session_id = await set_new_session_id();

    // generate tokens containing session ID
    const { access_token, refresh_token } = generateTokens({ username, session_id });

    // Set tokens in cookies and respond
    set_tokens(res, access_token, refresh_token);
    res.status(200).json({ message: 'Login successful' ,username});
}

/**
 * Logout by clearing cookies and removing refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
 async function logout(req, res) {
    // Clear session ID from DB and memory
    await clear_session_id();

    // Clear tokens
    clear_tokens(res);
    res.status(200).json({ message: 'Logout successful' });
}

async function update_password(req,res){
   const { new_password } = req.body;
   // Update the password using a service function
   await auth_service.update_password(new_password);

   res.status(200).json({ message: 'Password updated successfully' });

}

async function update_username(req,res){
    const { new_username } = req.body;
    // Update the username using a service function
    await auth_service.update_username(new_username);
    
   res.status(200).json({ message: 'Username updated successfully' });
}

async function get_user_info(req, res) {
    const user = await auth_service.get_user_info();
    res.status(200).json(user);
}

export default {
    login,
    logout,
    update_password,
    update_username,
    get_user_info
};

