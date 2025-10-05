import auth_service from '../services/auth_service.js';
import {set_tokens,generateTokens, clear_tokens} from '../services/token_service.js';
/**
 * Login with admin credentials
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
 async function login(req, res) {
    const { username , password } = req.body;
     await auth_service.verify_credentials(username, password);

    // Set cookies or tokens here
    const { access_token, refresh_token } = generateTokens({ username });
    set_tokens(res, access_token, refresh_token);

    // Respond with success message
    res.status(200).json({ message: 'Login successful' ,username});

}

/**
 * Logout by clearing cookies and removing refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
 async function logout(req, res) {
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

export default {
    login,
    logout,
    update_password,
    update_username
};

