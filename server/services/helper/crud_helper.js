import { run_in_transaction,build_update_query } from "../../utils/db_utils.js";
import { delete_image } from "../content_service.js";
import {
    record_entity_creation,
    record_entity_update,
    record_entity_deletion
} from "../log_service.js";
import App_error from "../../errors/AppError.js";

/**
 * Generic function to get all records from a table
 * @param {Object} db - The database connection
 * @param {string} tableName - The name of the table
 * @return {Promise<Array>} Array of records
 */
export async function getAll(db, tableName) {
  return await db.  all(`SELECT * FROM ${tableName};`) 
}

/**
 * Generic function to add a record with image
 * @param {Object} options
 * @param {string} options.tableName - The name of the table
 * @param {Object} options.data - The data to insert
 * @param {string|null} [options.display_name=null] - Optional display name for logging; if null, tableName is used
 * image is passed in data object
 * @return {Promise<number>} The ID of the newly added record
 */
export async function addWithImage(db, options) {
    const {
    tableName,
    data,
    display_name=null
  } = options;

const name = display_name || tableName;

  return await run_in_transaction(db, async () => {
    // build the query dynamically
    const fields_number = Object.keys(data).length;
    const placeholders = Array(fields_number).fill('?').join(', ');

    // find the column names
    const columns = [...Object.keys(data)];
   
    // gather the values
    const values = columns.map(field => data[field]);

    // finalize the query
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    const result = await db.run(query, values);// execute the query
    
    // Log the action
    await record_entity_creation(name);
    
    return result.lastID;
  });
}

/**
 * Generic function to update a record with optional image
 * @param {Object} options
 * @param {string} options.tableName - The name of the table
 * @param {number} options.id - The ID of the record to be updated
 * @param {Object} options.data - The data to update
 * @param {string|null} [options.image=null] - The new image filename, if any
 * @param {string} [options.imageField='image'] - The field name of the image
 * @param {string} [options.subfolder=''] - The subfolder where images are stored
 * @param {string|null} [options.display_name=null] - Optional display name for logging; if null, tableName is used
 * @returns {Promise<void>}
 */
export async function updateWithImage(db, options) {
  const {
    tableName,
    id,
    data = {},
    image = null,
    imageField = 'image',
    subfolder="",
    display_name=null
  } = options;

const name = display_name || tableName;
  await run_in_transaction(db, async () => {

    // Fetch existing record
    const oldRecord = await db.get(`SELECT ${imageField} FROM ${tableName} WHERE id = ?`, [id]);
    
    // Handle non-existent record
    if (!oldRecord) {
      if (image) await delete_image(image, subfolder);
      throw new App_error(`${name} with ID ${id} not found`, 404, `${name.toUpperCase()}_NOT_FOUND`);
    }
    
    // Add image to data if provided
    if (image) data[imageField] = image;
    
    // Build query dynamically
    const { query, values } = build_update_query(data, id, tableName);

    // Execute update
    const result = await db.run(query, values);
    
    // Handle failure
    if (result.changes === 0) {
      if (image) await delete_image(image, subfolder);
      throw new App_error(`Update failed for ${name} with ID ${id}`, 500, "UPDATE_FAILED");
    }
    
    // Log action
    await record_entity_update(name);

    // Delete old image if needed
    if (image && oldRecord[imageField]) {
      await delete_image(oldRecord[imageField], subfolder);
    }
  });
}

/**
 * Generic function to delete a record with image
 * @param {Object} options
 * @param {string} options.tableName - The name of the table
 * @param {number} options.id - The ID of the record to delete
 * @param {string} [options.imageField='image'] - The field name of the image
 * @param {string} [options.subfolder=''] - The subfolder where images are stored
 * @param {string|null} [options.display_name=null] - Optional display name for logging; if null, tableName is used
 * @returns {Promise<void>}
 */
export async function deleteWithImage(db, options) {
    const {
    tableName,
    id,
    imageField = 'image',
    subfolder = '',
    display_name=null
  } = options;

const name = display_name || tableName;

  await run_in_transaction(db, async () => {
    // Fetch existing record
    const oldRecord = await db.get(`SELECT ${imageField} FROM ${tableName} WHERE id = ?`, [id]);

    // Handle non-existent record
    if (!oldRecord) {
      throw new App_error(`${name} with ID ${id} not found`, 404, `${name.toUpperCase()}_NOT_FOUND`);
    }
    
    // Delete record
    const result = await db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    
    // Handle failure
    if (result.changes === 0) {
      throw new App_error(`Delete failed for ${name} with ID ${id}`, 500, "DELETE_FAILED");
    }
    
    // Log action
    await record_entity_deletion(name);

    // Delete image if exists
    if (oldRecord[imageField]) {
      await delete_image(oldRecord[imageField], subfolder);
    }
  });
}