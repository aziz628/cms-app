import db from "../DB/db_connection.js"

import {getAll,addWithImage,updateWithImage,deleteWithImage} from "./helper/crud_helper.js"

/**
 * Get all trainers
 * @returns {Promise<Object>} All trainers
 */
async function get_trainers() {
    return await getAll(db,"trainers");
}

/**
 * Add a new trainer
 * @param {Object} new_trainer - The trainer data to add
 * @returns {Promise<void>}
 */
async function add_trainer(new_trainer) {
    return await addWithImage(db,
        {
        tableName:"trainers",    
        data:new_trainer,
        display_name: "Trainer"
        });
}

/**
 * Update an existing trainer
 * @param {string} trainer_id - The ID of the trainer to update
 * @param {Object} updated_trainer - The new trainer data
 * @returns {Promise<void>}
 */
async function update_trainer(trainer_id, updated_trainer={},image=null) {
    return await updateWithImage(db,
        {
        tableName:"trainers",
        id:trainer_id,
        data:updated_trainer,
        image,
        subfolder:"trainers",
        display_name: "Trainer"
        });
}

/**
 * Delete a trainer
 * @param {string} trainer_id - The ID of the trainer to delete
 * @returns {Promise<void>}
 */
async function delete_trainer(trainer_id) {
    return await deleteWithImage(db,
        {
        tableName:"trainers",    
        id:trainer_id,
        subfolder:"trainers"
        ,display_name: "Trainer"
        });
}

export default {
    get_trainers,
    add_trainer,
    update_trainer,
    delete_trainer
};