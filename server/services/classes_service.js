import db from "../DB/db_connection.js"
import {
  getAll,
  addWithImage,
  updateWithImage,
  deleteWithImage
} from "./helper/crud_helper.js";


/**
 * Retrieves all classes from the content storage.
 * @returns {Promise<Object>} An object containing all classes and the next item ID.
 */
async function get_all() {
    return await getAll(db, "classes"); 
}



/**
 * Adds a new class to the content storage.
 * @param {Object} new_class - The class object to be added.
 * @param {string} image - The image filename associated with the class.
 * @returns {Promise<void>}
 */
async function add_class(new_class) {
    return await addWithImage(db, {
        tableName: "classes",
        data: new_class,
        fields:['name', 'description', 'private_coaching', 'image']
        ,display_name: "Class",
    });
}

/**
 * Updates an existing class in the content storage.
 * @param {number} id - The ID of the class to be updated.
 * @param {Object} updatedClass - The updated class object.
 * @returns {Promise<void>}
 */
async function update_class(id, updated_Class={}, image=null) {
    return await updateWithImage(db, {
        tableName: "classes",
        id,
        data: updated_Class,
        image,
        fields:['name', 'description', 'private_coaching'],
        subfolder: "classes",
        display_name: "Class"
    });
}


/**
 * Deletes a class from the content storage by its ID.
 * @param {number} classId - The ID of the class to be deleted.
 * @returns {Promise<void>}
 */
async function delete_class(class_id) {
     return await deleteWithImage(db, {
        tableName: "classes",
        id: class_id,
        imageField: "image",
        subfolder: "classes",
        display_name: "Class"
    });
}

export default {
    get_all,
    add_class,
    update_class,
    delete_class
};