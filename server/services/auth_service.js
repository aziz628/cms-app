import bcrypt from 'bcrypt';
import App_error  from '../errors/AppError.js';
import { logWarning } from './logging_service.js';

import db from '../DB/db_connection.js';

/**
 * Verifies admin credentials.
 * @param {string} username - The username to verify.
 * @param {string} password - The password to verify.
 * @returns {Promise<boolean>} - True if credentials are valid, false otherwise.
 */

// compare and if false through error
export async function verify_credentials(username, password) {
    try {
    // check is user with given username exists 
    const user = await db.get('SELECT * FROM admin WHERE username = ?', [username]);
    if (!user) {
        throw new App_error('Invalid username', 401, 'INVALID_USERNAME');
    }
    
    // check if user's password is valid
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new App_error('Invalid password', 401, 'INVALID_PASSWORD');
    }
    } catch (error) {
        logWarning('Failed login attempt', 400, '/api/auth/login', 'POST',
            `Username: ${username}, Reason: Invalid credentials`);
        throw error;
    }
}

/** Updates the admin password.
 * @param {string} new_password - The new password to set.
 * @returns {Promise<void>}
 * @throws {AppError} If the password update fails.
 * */
async function update_password(new_password){
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const result= await db.run('UPDATE admin SET password = ? ', [hashedPassword]);
    if (result.changes === 0) {
        throw new App_error('Failed to update password', 500, 'PASSWORD_UPDATE_FAILED');
    }
}

/** Updates the admin username.
 * @param {string} new_username - The new username to set.
 * @returns {Promise<void>}
 * @throws {AppError} If the username update fails.
 * */
async function update_username(new_username){
    const result = await db.run('UPDATE admin SET username = ? ', [new_username]);
    if (result.changes === 0) {
        throw new App_error('Failed to update username', 500, 'USERNAME_UPDATE_FAILED');
    }
}

export default {
    verify_credentials,
    update_password,
    update_username
};