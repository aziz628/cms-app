import db from "../DB/db_connection.js";
import {record_entity_creation,
  record_entity_deletion,
  record_entity_update  
}from "./log_service.js";
import AppError from "../errors/AppError.js";
import { run_in_transaction } from "../utils/db_utils.js";
/**
 * Get general info data
 * @returns {Promise<Object>} General info data
 */
 async function get_info() {
  // select both from general_info and business_hour using json_object as two keys and the buisness hours as an array
    let {data=null} = await db.get(`
      SELECT json_object(
        'business_hours',
        (
          SELECT json_group_array(
            json_object('id', id, 'day', day, 'open_time', open_time, 'close_time', close_time)
          )
          FROM business_hour
        ),
        'about_summary',
        (SELECT about_summary FROM general_info LIMIT 1)
      ) as data
    `);
    data = data ? JSON.parse(data) : { business_hours: [], about_summary: '' };

    return data ;
}


// add business hours
async  function create_business_hour (new_business_hour){
  return await run_in_transaction(db,async ()=>{

    const result = await db.run(`INSERT into business_hour (day, open_time, close_time) values (?, ?, ?)`, [
      new_business_hour.day,
      new_business_hour.open_time,
      new_business_hour.close_time
    ]);

    await record_entity_creation("business hour");

    return result.lastID;
  }) 
   
}

async function delete_business_hour(id) {
  return await run_in_transaction(db,async ()=>{

    const result = await db.run(`DELETE from  business_hour where id = ?`,[id]) 
    if(result.changes === 0){
      throw new AppError(`No business hour found with ID ${id}`, 404, "BUSINESS_HOUR_NOT_FOUND");
    }

    await record_entity_deletion("business hour")

  }) 
}
/**
 * Update business hours
 * @param {Object} hours - The new business hours
 * @returns {Promise<void>}
 */
  async function update_business_hour(id,business_hours) {
  return await run_in_transaction(db, async () => {

    const set_clause = Object.keys(business_hours).map(field => `${field} = ?`).join(", ");
    const values = Object.values(business_hours);
    values.push(id); // for the WHERE clause
    
    const result=await db.run(`UPDATE business_hour SET ${set_clause} Where id = ?`, values);
    if(result.changes === 0){
      throw new AppError(`No business hour found with ID ${id}`, 404, "BUSINESS_HOUR_NOT_FOUND");
    }
    await record_entity_update("business hour");
  });
}

/**
 * Update about summary
 * @param {string} summary - The new about summary
 * @returns {Promise<void>}
 */
async function update_about_summary(summary) {
  return await run_in_transaction(db,async () => {
  
    await db.run(`UPDATE general_info SET about_summary = ?`, [summary]);

    await record_entity_update("about summary");
  });
}



export default {
  get_info,
  update_about_summary,
  update_business_hour,
  delete_business_hour,
  create_business_hour
};