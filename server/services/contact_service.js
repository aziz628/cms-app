import db from "../DB/db_connection.js";
import {
    record_entity_update,
}from "./dashboard_service.js";
import { run_in_transaction } from "../utils/db_utils.js";
import AppError from "../errors/AppError.js";
import {CONTACT,SOCIAL_MEDIA_LINKS} from '../DB/db_constants.js';

/**
 * Retrieves contact information along with associated social media links.
 * @returns {Promise<Array>} An array of contact information objects with social media links.
 */
async function get_info() {
    // contact table and social_media_link
    let {data=null} = await db.get(`
        SELECT json_object(
                'contact_info', (
                    SELECT json_object('address', ${CONTACT.ADDRESS}, 'phone_number', ${CONTACT.PHONE_NUMBER}, 'email', ${CONTACT.EMAIL})
                    FROM ${CONTACT.TABLE_NAME} LIMIT 1
                ),
                'social_media_links', (
                    SELECT json_group_array(
                    json_object('id', ${SOCIAL_MEDIA_LINKS.ID}, 'platform', ${SOCIAL_MEDIA_LINKS.PLATFORM}, 'link', ${SOCIAL_MEDIA_LINKS.LINK})
                    ) FROM ${SOCIAL_MEDIA_LINKS.TABLE_NAME}
                )
        ) AS data;
        `);
    // To access the merged data:
    data = data ? JSON.parse(data) 
                : {
                    contact_info:{address: "", phone_number: "", email: ""}, 
                    social_media_links:[]
                };

    return data;
}

//  create social media link
async function create_social_media_link(link_data) {
    return await run_in_transaction(db, async () => {

        // insert the link_data
        const result = await db.run(`
            INSERT INTO ${SOCIAL_MEDIA_LINKS.TABLE_NAME} (${SOCIAL_MEDIA_LINKS.PLATFORM}, ${SOCIAL_MEDIA_LINKS.LINK})
            VALUES (?, ?)
        `, [link_data.platform, link_data.link]);

        if (!result.lastID) {
            throw new AppError("Failed to add social media link", 500, "ADD_LINK_FAILED");
        }

        await record_entity_update("social media link");
        return result.lastID;
    });
}

/**
 * Updates a social media link with the provided data.
 * @param {Object} link_data - The data to update the social media link with.
 * @param {number} link_id - The ID of the social media link to update.
 * @returns {Promise<void>}
 * @throws {AppError} If no social media link is found with the provided ID.
 * */
async function update_social_media(link_data, link_id) {
    await run_in_transaction(db, async () => {
        
    // update the link_data
   const placeholders = Object.keys(link_data).map((key) => `${key} = ?`).join(', ');
   const values = Object.values(link_data);

   const query=`UPDATE ${SOCIAL_MEDIA_LINKS.TABLE_NAME} SET ${placeholders} WHERE id = ?`
    const result = await db.run(query, [...values, link_id]);

    if (result.changes === 0) {
        throw new AppError(`No social media link found with ID ${link_id}`, 404, "LINK_NOT_FOUND");
    }

    await record_entity_update("social media link");
    })
}
// delete social media link by id
async function delete_social_media(link_id) {

    await run_in_transaction(db, async () => {
        // delete the link_data
        const result = await db.run(`
            DELETE FROM ${SOCIAL_MEDIA_LINKS.TABLE_NAME}
            WHERE id = ?
        `, [link_id]);

        // if no changes were made, then the id is not found (other cases should be thrown by the db itself)
        if (result.changes === 0) {
            throw new AppError(`No social media link found with ID ${link_id}`, 404, "LINK_NOT_FOUND");
        }

        await record_entity_update("social media link");
    });
}
/**
 * Updates the address in the contact information.
 * @param {string} address - The new address to set.
 * @returns {Promise<void>}
 * @throws {AppError} If no contact information is found to update.
 */
async function update_address(address) {
    // there is only one contact info row, so we can read it directly
    await run_in_transaction(db, async () => {
        
        // check if contact info exists
        const data = await db.get(`SELECT 1 FROM ${CONTACT.TABLE_NAME} LIMIT 1`);
        if (!data) {
            throw new AppError("No contact info found to update address", 404, "CONTACT_NOT_FOUND");
        }

        // update the address
        await db.run(`UPDATE ${CONTACT.TABLE_NAME} SET address = ? `, [address]);

        await record_entity_update("contact address");
    });
}

async function update_phone_number(phone_number) {
    await run_in_transaction(db, async () => {
        const data = await db.get(`SELECT * FROM ${CONTACT.TABLE_NAME} LIMIT 1`);

        if (!data) {
            throw new AppError("No contact info found to update phone number", 404, "CONTACT_NOT_FOUND");
        }
        // update the phone number
        await db.run(`UPDATE ${CONTACT.TABLE_NAME} SET ${CONTACT.PHONE_NUMBER} = ?  `, [phone_number]);

        await record_entity_update("contact phone number");
    });
}

async function update_email(email) {
    await run_in_transaction(db, async () => {
        const data = await db.get(`SELECT * FROM ${CONTACT.TABLE_NAME} LIMIT 1`);
        if (!data) {
            throw new AppError("No contact info found to update email", 404, "CONTACT_NOT_FOUND");
        }
        // update the email
        await db.run(`UPDATE ${CONTACT.TABLE_NAME} SET ${CONTACT.EMAIL} = ?  `, [email]);

        await record_entity_update("contact email");
    });
}

export default {
    get_info,
    create_social_media_link,
    update_social_media,
    update_address,
    update_phone_number,
    update_email,
    delete_social_media
};
