import bcrypt from 'bcrypt';
import App_error  from '../errors/AppError.js';
import { logWarning } from './logging_service.js';
import {ADMIN} from '../DB/db_constants.js';
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
        const user = await db.get(`SELECT * FROM ${ADMIN.TABLE_NAME} WHERE ${ADMIN.USERNAME} = ?`, [username]);
        if (!user) {
            throw new App_error('Invalid username', 401, 'INVALID_USERNAME');
        }
        
        // check if user's password is valid
        const isValidPassword = await bcrypt.compare(password, user[ADMIN.PASSWORD]);
        if (!isValidPassword) {
            throw new App_error('Invalid password', 401, 'INVALID_PASSWORD');
        }
    } catch (error) {
        // Log failed login attempt
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
    // Hash the new password 
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the password in the database
    const result= await db.run(`UPDATE ${ADMIN.TABLE_NAME} SET password = ? `, [hashedPassword]);
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
    const result = await db.run(`UPDATE ${ADMIN.TABLE_NAME} SET username = ? `, [new_username]);
    if (result.changes === 0) {
        throw new App_error('Failed to update username', 500, 'USERNAME_UPDATE_FAILED');
    }
}
/** Retrieves admin user information.
 * @returns {Promise<Object>} An object containing the admin user's information.
 * @throws {AppError} If the retrieval fails.
 */
async function get_user_info() {
    const user = await db.get(`SELECT ${ADMIN.USERNAME} FROM ${ADMIN.TABLE_NAME} `);
    return user;
}

export default {
    verify_credentials,
    update_password,
    update_username,
    get_user_info
};