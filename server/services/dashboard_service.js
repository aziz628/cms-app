import db from "../DB/db_connection.js"
import { get_total_pages, PAGE_SIZE } from "./helper/pagination_helper.js";
import {DASHBOARD} from '../DB/db_constants.js';

/**
 * Reads the admin actions log from a JSON file.
 * @param {number} page - The page number for pagination ( start from 1) .
 * @returns {Promise<Array>} An array of logged actions.
 * @throws {App_error} If reading the log file fails.
 */
async function get_admin_actions(page) {

    // Calculate offset based on page number
    const offset = (page - 1) * PAGE_SIZE;
    const data = await db.all(`SELECT ${DASHBOARD.ACTION}, ${DASHBOARD.TIMESTAMP}, ${DASHBOARD.ICON} FROM ${DASHBOARD.TABLE_NAME} LIMIT ${PAGE_SIZE} OFFSET ${offset}`);

    // Add pagination info
    const totalPages = await get_total_pages(db, DASHBOARD.TABLE_NAME);

    return { data, totalPages, PAGE_SIZE };
}

/**
 * Saves an action to the admin actions log.
 * @param {string} action - The action performed by the admin.
 * @param {string} icon - The icon associated with the action.
 * @returns {Promise<void>}
 */
async function save_action(action, icon) {

       // Insert the action into the database
        await db.run(
            `INSERT INTO ${DASHBOARD.TABLE_NAME} (${DASHBOARD.ACTION}, ${DASHBOARD.ICON}) VALUES (?, ?)`,
            [action, icon]
        );
    
    if (process.env.NODE_ENV === 'development') console.log('Action logged successfully');
}


// -- Helper functions for logging admin actions

async function record_entity_creation(entity_name) {
    await save_action(`${entity_name} created`, "create");
}
async function record_entity_update(entity_name) {
    await save_action(`${entity_name} updated`, "update");
}
async function record_entity_deletion(entity_name) {
    await save_action(`${entity_name} deleted`, "delete");
}

export  {
    get_admin_actions,
    record_entity_creation,
    record_entity_update,
    record_entity_deletion
};
