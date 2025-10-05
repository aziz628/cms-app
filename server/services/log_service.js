import db from "../DB/db_connection.js"


/**
 * Reads the admin actions log from a JSON file.
 * @returns {Promise<Array>} An array of logged actions.
 * @throws {App_error} If reading the log file fails.
 */
async function get_actions_log(page) {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;
    const logs = await db.all(`SELECT action, timestamp, icon FROM admin_log LIMIT ${pageSize} OFFSET ${offset}`);
    // Add pagination info
    const countResult = await db.get(`SELECT COUNT(*) as count FROM admin_log`);
    const totalCount = countResult.count;
    const totalPages = Math.ceil(totalCount / pageSize);
    return { logs, totalPages };
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
            "INSERT INTO admin_log (action, icon) VALUES (?, ?)",
            [action, icon]
        );
    

    if (process.env.NODE_ENV === 'development') console.log('Action logged successfully');
}


// -- Helper functions for specific actions

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
    get_actions_log,
    record_entity_creation,
    record_entity_update,
    record_entity_deletion
};
