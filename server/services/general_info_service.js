import db from "../DB/db_connection.js";
import {record_entity_creation,
  record_entity_deletion,
  record_entity_update  
}from "./dashboard_service.js";
import { delete_image } from "./content_service.js";
import AppError from "../errors/AppError.js";
import { run_in_transaction } from "../utils/db_utils.js";

const DEFAULT_HERO_IMAGE=process.env.DEFAULT_HERO_IMAGE;
const DEFAULT_ABOUT_IMAGE=process.env.DEFAULT_ABOUT_IMAGE;

/**
 * Get general info data which includes 
 * business hours
 * about section summary
 * about section image,
 * hero section title,
 * hero section subtitle,
 * hero section image
 *
 * @returns {Promise<Object>} General info data
 */
async function get_info() {

  let {data=null} = await db.get(`
      SELECT json_object(
        'business_hours',
        (
          SELECT json_group_array(
            json_object('id', id, 'day', day, 'open_time', open_time, 'close_time', close_time)
          )
          FROM business_hour
        ),
        'about_summary' , (SELECT about_summary FROM general_info LIMIT 1) ,
        'about_image' , (SELECT about_image FROM general_info LIMIT 1) ,
        'hero_title' , (SELECT hero_title FROM general_info LIMIT 1) ,
        'hero_subtitle' , (SELECT hero_subtitle FROM general_info LIMIT 1) ,
        'hero_image', (SELECT hero_image FROM general_info LIMIT 1) 
      ) as data
    `);
    data = data ? JSON.parse(data) : { 
      business_hours: [],
      about_summary: '',
      about_image: DEFAULT_ABOUT_IMAGE,
      hero_title: 'Transform Your Body & Mind',
      hero_subtitle: 'Join our community of fitness enthusiasts and achieve your goals with expert guidance and state-of-the-art facilities.',
      hero_image: DEFAULT_HERO_IMAGE,
    };
    

   // Sort the business hours using the first part of the day string.
    data.business_hours.sort((a, b) => {
      return getDayIndex(a.day) - getDayIndex(b.day);
    });

    return data;
}

/**
 * helper to  Get the index of a day in the week.
 */
const getDayIndex = (dayStr) => {
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        // If the day string contains a '-', split and use the first part.
        const day = dayStr.includes('-') ? dayStr.split('-')[0] : dayStr;
        // Return the index of the day in the week.
        return dayOrder.indexOf(day.toLowerCase());
      };


// -- business hour  crud operations -- //

/* create new working business hour */

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


/* delete business hour by id */
async function delete_business_hour(id) {
  return await run_in_transaction(db,async ()=>{

    const result = await db.run(`DELETE from  business_hour where id = ?`,[id]) 
    if(result.changes === 0){
      throw new AppError(`No business hour found with ID ${id}`, 404, "BUSINESS_HOUR_NOT_FOUND");
    }

    await record_entity_deletion("business hour")

  }) 
}


// -- update-only operations for general info -- //

/**
 * Update about summary
 * @param {string} summary - The new about summary
 * @returns {Promise<void>}
 */
async function update_about_summary(summary) {
  return await run_in_transaction(db,async () => {
    // check if general_info row exists
    const row = await db.get(`SELECT 1 FROM general_info LIMIT 1`);
    if (!row) {
      throw new AppError(`General info not found`, 404, "GENERAL_INFO_NOT_FOUND");
    }
    await db.run(`UPDATE general_info SET about_summary = ?`, [summary]);

    await record_entity_update("about summary");
  });
}

/**
 *  Update the about section image
 * @param {string} about_image - The new about image
 */
async function update_about_image(about_image){
  return await run_in_transaction(db,async ()=>{
    const row = await db.get(`SELECT about_image FROM general_info LIMIT 1`);
    
    if (!row) {
      throw new AppError(`General info not found`, 404, "GENERAL_INFO_NOT_FOUND");
    }
    
    // replace with new one
    await db.run(`UPDATE general_info SET about_image = ?`, [about_image]);

    await record_entity_update("about image");
    
    // delete the old image
      if(row.about_image !== DEFAULT_ABOUT_IMAGE){
        await delete_image(row.about_image,'general_info');
      }
  });
}

/* Update hero title */
async function update_hero_title(title) {
  return await run_in_transaction(db,async () => {
    // check if row exist
    const row = await db.get(`SELECT 1 FROM general_info LIMIT 1`);
    if (!row) {
      throw new AppError(`General info not found`, 404, "GENERAL_INFO_NOT_FOUND");
    }
    // update the title
    await db.run(`UPDATE general_info SET hero_title = ?`, [title]);

    await record_entity_update("hero title");
  });
}

/* Update hero subtitle */
export async function update_hero_subtitle(subtitle) {
  return await run_in_transaction(db,async () => {
    
    // check if row exist
    const row = await db.get(`SELECT 1 FROM general_info LIMIT 1`);

    if (!row) {
      throw new AppError(`General info not found`, 404, "GENERAL_INFO_NOT_FOUND");
    }
    await db.run(`UPDATE general_info SET hero_subtitle = ?`, [subtitle]);

    await record_entity_update("hero subtitle");
  });
}

/* Update hero image */
export async function update_hero_image(image) {
  return await run_in_transaction(db,async () => {
    const row = await db.get(`SELECT hero_image FROM general_info LIMIT 1`);
    if (!row) {
      throw new AppError(`General info not found`, 404, "GENERAL_INFO_NOT_FOUND");
    }
    await db.run(`UPDATE general_info SET hero_image = ?`, [image]);
    
    await record_entity_update("hero image");
    
    // delete the old image
      if(row.hero_image !== DEFAULT_HERO_IMAGE){
        await delete_image(row.hero_image,'general_info');
      }
  });
}


export default {
  get_info,
  update_about_summary,
  update_about_image,
  update_business_hour,
  delete_business_hour,
  create_business_hour,
  update_hero_title,
  update_hero_subtitle,
  update_hero_image,
};