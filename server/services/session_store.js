import db from '../DB/db_connection.js';
import { ADMIN } from '../DB/db_constants.js';
import { randomUUID } from 'crypto';

// In-memory session storage
let current_session_id = null;

/**
 * Initialize session store on server boot
 */
export async function init_session_store() {
    // Load current session ID from database
    const row = await db.get(`SELECT ${ADMIN.SESSION_ID} FROM ${ADMIN.TABLE_NAME}`);
    
    // Set in-memory session ID
    current_session_id = row ? row[ADMIN.SESSION_ID] : null;

    console.log('Session store initialized, current session:', current_session_id);
}

/**
 * Get current session ID from memory
 */
export function get_current_session_id() {
  return current_session_id;
}

/**
 * Generate and set new session ID
 */
export async function set_new_session_id() {
  try {
  const new_session_id = randomUUID();

    // update the session ID in DB
    await db.run(`UPDATE ${ADMIN.TABLE_NAME} SET ${ADMIN.SESSION_ID} = ?`, [new_session_id]);

    // Update memory
    current_session_id = new_session_id;
    if (process.env.NODE_ENV === 'development') {
        console.log('New session ID set:', new_session_id);
    }

    return new_session_id;

  } catch (error) {
    console.error('Failed to set new session ID:', error);
    throw error;
  }
}

/**
 * Clear session ID (logout)
 */
export async function clear_session_id() {
  // Wait for DB write
  await db.run(`UPDATE ${ADMIN.TABLE_NAME} SET ${ADMIN.SESSION_ID} = NULL`);
  
  // Clear memory
  current_session_id = null;

  if (process.env.NODE_ENV === 'development') {
      console.log('Session ID cleared');
  }
}

/**
 * Verify session ID matches current
 */
export function verify_session_id(token_session_id) {
  // Compare provided session ID with current
  return current_session_id && token_session_id === current_session_id;
}