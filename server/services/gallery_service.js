import { delete_image } from "./content_service.js";
import {
    record_entity_creation,
    record_entity_update,
    record_entity_deletion
} from "./log_service.js";
import { run_in_transaction } from "../utils/db_utils.js";
import App_Error from "../errors/AppError.js";
import db from "../DB/db_connection.js";

/**
    * Retrieves all gallery categories along with their associated images.
    * @returns {Promise<Array>} An array of categories, each with its associated images.
*/
async function get_all_categories_and_images() {
        // Retrieve all categories with their associated images
        // use json and subqueries to have an object showing two arrays categories and images
        let {data=null} = await db.get(`
             SELECT json_object(
            'categories', (
                SELECT json_group_array(
                    json_object(
                        'id', c.id,
                        'name', c.name
                    )
                )
                FROM gallery_category c
            ),
            'images', (
                SELECT json_group_array(
                    json_object(
                        'id', i.id,
                        'name', i.name,
                        'filename', i.filename,
                        'description', i.description,
                        'category_id', i.category_id,
                        'category_name', c.name
                    )
                )
                FROM gallery_image i
                JOIN gallery_category c ON i.category_id = c.id
                WHERE i.id IS NOT NULL
            )
        ) as data
    
            `)
        data = data ? JSON.parse(data) : {categories:[],images:[]};

        return data;
          /*
          (`
        SELECT json_group_array(
            json_object(
                'id', c.id,
                'name', c.name,
                'images', COALESCE(images.images, json('[]'))
            )
        ) AS data
        FROM gallery_category c
        LEFT JOIN (
            SELECT category_id,
                   json_group_array(
                       json_object(
                           'id', id,
                           'name', name,
                           'filename', filename,
                           'description', description
                       )
                   ) AS images
            FROM gallery_image
            GROUP BY category_id
        ) images ON images.category_id = c.id;
    `);*/
}

 /**
 * Adds a new category to the gallery.
 * @param {string} name - The name of the new category.
 * @returns {Promise<number>} The ID of the newly created category.
 */
async function add_category(name) {

    return await run_in_transaction(db, async () => {
        const result = await db.run(
            "INSERT into gallery_category (name) values (?)",
            [name]
        );
        await record_entity_creation("gallery category");
        return result.lastID;
    });

    
}
/** * Adds a new image to a specific category.
 * @param {number} category_id - The ID of the category to which the image will be added.
 * @param {Object} new_image_data - The data of the new image.
 * @param {string} filename - The filename of the uploaded image.
 * @returns {Promise<number>} The ID of the newly created image.
 */
async function add_image(category_id, new_image_data) {

    return await run_in_transaction(db, async () => {
        // Check if category exists
        const category = await db.get("SELECT * FROM gallery_category WHERE id = ?", [category_id]);
        if (!category) {
            throw new App_Error("Category not found", 404, "CATEGORY_NOT_FOUND");
        }

        // build the query using keys and values from the new data for new image
        
        const fields = Object.keys(new_image_data);
        fields.push("category_id"); // Add the category_id field
        const set_clause = Array(fields.length).fill("?").join(", ");

        const values = Object.values(new_image_data);
        values.push(category_id); // Add the category_id value

        // final the insert query and execute it
        const query = ` INSERT INTO gallery_image (${fields}) VALUES (${set_clause})`;
        const result = await db.run(query, values);
        
        // query fail throw error
        if (result.changes === 0) {
            throw new App_Error("Category not found", 404, "CATEGORY_NOT_FOUND");
        }
        await record_entity_creation("gallery image");

        return result.lastID;
    });
}

/**
 * Updates an existing category.
 * @param {number} category_id - The ID of the category
 * @param {string} name - The new name for the category.
 * @returns {Promise<void>} 
 * Throws an error if the category does not exist.
 */
async function update_category(category_id, name) {

    await run_in_transaction(db, async () => {
        const result = await db.run(
            "UPDATE gallery_category SET name = ? WHERE id = ?",
            [name, category_id]
        );
        if (result.changes === 0) {
           throw new App_Error("Category not found", 404, "CATEGORY_NOT_FOUND");
       }
       await record_entity_update("gallery category");
   });
}
/**
 * Updates an existing image.
 * @param {number} category_id - The ID of the category to which the image belongs.
 * @param {number} image_id - The ID of the image to update.
 * @param {Object} updated_image_info - The updated image information.
 * @param {string} image_new_filename - The new filename for the image (if it has changed).
 * @returns {Promise<void>}
 * Throws an error if the category or image does not exist.
 */
async function update_image(category_id, image_id, updated_image_info={}) {

   await run_in_transaction(db,async () => {
         // Check if image exists
         const old_image = await db.get(
              `SELECT * FROM gallery_image JOIN gallery_category 
              ON gallery_image.category_id = gallery_category.id 
              WHERE gallery_image.id = ? AND gallery_category.id = ?`,
              [image_id, category_id]
            );
            if (!old_image) {
                if (updated_image_info?.filename) await delete_image(updated_image_info.filename, "gallery");
                throw new App_Error("Image not found", 404, "IMAGE_NOT_FOUND");
            }
            // build the query using keys and values from the new data for new image
            

            // build and execute the update query
            const fields = Object.keys(updated_image_info);
            const values = Object.values(updated_image_info);
            const set_clause = fields.map(field => `${field} = ?`).join(", ");

            values.push(image_id); // Add the image ID for the WHERE clause
            values.push(category_id); // Add the category ID for the WHERE clause
            const query = ` UPDATE gallery_image SET ${set_clause} WHERE id = ? AND category_id = ?`;
            // final the insert query and execute it
           const result = await db.run(
               query,
               values
           );   
              if (result.changes === 0) {
                  throw new App_Error("Image not found", 404, "IMAGE_NOT_FOUND");
              }
            await record_entity_update("gallery image");
            
            // delete the old image file from the filesystem if it exists and new image provided
            if (old_image?.filename && updated_image_info?.filename ) {
                await delete_image(old_image.filename, "gallery");
            }
       });

}


/**
 * Deletes a category and all its images.
 * @param {number} category_id - The ID of the category to delete.
 * @returns {Promise<void>}
 */
async function delete_category(category_id) {
    
    await run_in_transaction(db,async () => {
        // get the category 
        const category = await db.get("SELECT * FROM gallery_category WHERE id = ?", [category_id]);
        if (!category) {
            throw new App_Error("Category not found", 404, "CATEGORY_NOT_FOUND");
        }
        // get all images in that category  
        const images = await db.all("SELECT filename FROM gallery_image WHERE category_id = ?", [category_id]);

        // delete all images in that category from the database
        await db.run("DELETE FROM gallery_image WHERE category_id = ?", [category_id]);
        
        // delete the category from the database
        await db.run("DELETE FROM gallery_category WHERE id = ?", [category_id]);
        
        // log the deletion
        await record_entity_deletion("gallery category");

        // delete all image files from the filesystem
        for (const img of images) {
            if (img?.filename) await delete_image(img.filename, "gallery");
        }
    });
}
/**
 * Deletes an image from a specific category.
 * @param {number} category_id - The ID of the category from which the image will be deleted.
 * @param {number} image_id - The ID of the image to delete.
 * @returns {Promise<void>}
 * Throws an error if the category or image does not exist.
 */
async function delete_gallery_image(category_id, image_id) {
   
    await run_in_transaction(db,async () => {
        // Check if image exists in the specified category
        const image = await db.get(
            `SELECT * FROM gallery_image JOIN gallery_category 
             ON gallery_image.category_id = gallery_category.id 
             WHERE gallery_image.id = ? AND gallery_category.id = ?`,
            [image_id, category_id]
        );
        if (!image) {
            throw new App_Error("Image not found", 404, "IMAGE_NOT_FOUND");
        }
        // Delete the image from the database
        await db.run("DELETE FROM gallery_image WHERE id = ?", [image_id]);

        await record_entity_deletion("gallery image");

        // Delete the image file from the filesystem
        if (image?.filename) await delete_image(image.filename, "gallery");
        
    });
}


export default {
    get_all_categories_and_images,
    add_category,
    add_image,
    update_category,
    update_image,
    delete_category,
    delete_gallery_image
};
