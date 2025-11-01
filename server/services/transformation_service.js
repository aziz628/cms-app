import { delete_image } from "./content_service.js";
import {record_entity_creation,record_entity_update,record_entity_deletion } from "./log_service.js";
import db from "../DB/db_connection.js";
import { run_in_transaction } from "../utils/db_utils.js";

import AppError from "../errors/AppError.js";

async function get_all() {
        return await db.all(`SELECT * FROM transformations`);
}

async function add_transformation(new_transformation) {
    return await run_in_transaction(db, async () => {
        const result = await db.run(`INSERT INTO transformations (name, description, before_image, after_image) VALUES (?, ?, ?, ?)`,
            [new_transformation.name, new_transformation.description || null, new_transformation.before_image || null, new_transformation.after_image || null]);
        // should i check if the insertion was successful?
        await record_entity_creation("transformation");
        return result.lastID;
    });
}

async function update_transformation(transformation_id, updated_data) {
    return await run_in_transaction(db, async () => {
        // Check if the transformation exists before updating
        const existingTransformation = await db.get(`SELECT before_image, after_image FROM transformations WHERE id = ?`, [transformation_id]);
        if (!existingTransformation) {
            // delete the uploaded images if transformation not found
            if (updated_data.before_image) await delete_image(updated_data.before_image, "transformations");
            if (updated_data.after_image) await delete_image(updated_data.after_image, "transformations");

            throw new AppError(`Transformation with ID ${transformation_id} not found`, 404, "TRANSFORMATION_NOT_FOUND");
        }
        // build the update query dynamically based on provided fields
        let fields = Object.keys(updated_data);
        let values = Object.values(updated_data);
        let set_clause = fields.map(field => `${field} = ?`).join(", ");
        values.push(transformation_id); // for the WHERE clause

        await db.run(`UPDATE transformations SET ${set_clause} WHERE id = ?`, values);

        if (db.changes === 0) {
            throw new AppError("No changes applied to the transformation", 400, "NO_CHANGES_APPLIED");
        }

        await record_entity_update("transformation");

        // delete old images if new ones are provided
        if (updated_data.before_image && existingTransformation.before_image) {
            await delete_image(existingTransformation.before_image, "transformations");
        }
        if (updated_data.after_image && existingTransformation.after_image) {
            await delete_image(existingTransformation.after_image, "transformations");
        }

    });
}

async function delete_transformation(transformation_id) {
    return await run_in_transaction(db, async () => {
        // Check if the transformation exists before deleting
        const existingTransformation = await db.get(`SELECT before_image, after_image FROM transformations WHERE id = ?`, [transformation_id]);
        if (!existingTransformation) {
            throw new AppError(`Transformation with ID ${transformation_id} not found`, 404, "TRANSFORMATION_NOT_FOUND");
        }
        
        await db.run(`DELETE FROM transformations WHERE id = ?`, [transformation_id]);
        
        await record_entity_deletion("transformation");

        // Delete the images associated with the transformation
        if (existingTransformation.before_image) {
            await delete_image(existingTransformation.before_image, "transformations");
        }
        if (existingTransformation.after_image) {
            await delete_image(existingTransformation.after_image, "transformations");
        }
    });
}

export default {
    get_all,
    add_transformation,
    update_transformation,
    delete_transformation
}