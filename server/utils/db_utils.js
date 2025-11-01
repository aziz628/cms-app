import fs from "fs"
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * Run database operations in a transaction
 * @param {object} db - The database connection object.
 * @param {Function} fn - The async function containing database operations to be executed within the transaction.
 * @returns {Promise<*>} The result of the function `fn`.
 */
export async function run_in_transaction(db, fn) {
  await db.run("BEGIN TRANSACTION;");
  try {
    // execute the provided function
    const result = await fn();
    // if successful, commit the transaction
    await db.run("COMMIT;");
    return result;
  } catch (err) {
    // if any error occurs, rollback the transaction
    await db.run("ROLLBACK;");
    throw err;
  }
}

/**
 * Build a dynamic update query
 * @param {object} data - An object containing the fields to be updated and their new values.
 * @param {number} id - The ID of the record to update
 * @param {string} tableName - The name of the table to update (defaults to 'classes')
 * @returns {object} An object containing the SQL fields string and the corresponding values array.
 */
export function build_update_query(data,id,tableName) {
  // prepare the query parts
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  // Add id to values array for WHERE clause
  values.push(id);
  
  // finalize the query and execute
  const query = `UPDATE ${tableName} SET ${fields.join(", ")} WHERE id = ?;`;
  
  // return the query
  return {query, values}
}
