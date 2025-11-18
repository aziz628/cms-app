import gallery_service from "../services/gallery_service.js";
/**
 * Fetch all categories and images from the service
 */

async function get_all_categories_and_images(req, res) {
    const data = await gallery_service.get_all_categories_and_images();
    res.status(200).json(data);
}

/** Add a new category
 */
async function add_category(req, res) {
    const { name } = req.body;
    const category_id = await gallery_service.add_category(name);
    res.status(201).json({ message: "Category added successfully", category_id });
}

/** Add a new image to a category
 */
async function add_image(req, res) {
    const { category_id } = req.params;
    const imageData = req.body;
    imageData.filename = req?.file?.filename; // Assuming file is uploaded using multer
    const image_id = await gallery_service.add_image(category_id, imageData);
    res.status(201).json({
        message: "Image added successfully",
        image_id,
        image_name: imageData.filename
    });
}
/** Update a category name
 */
async function update_category(req, res) {
    const { category_id } = req.params;
    const { name } = req.body;
    await gallery_service.update_category(category_id, name);
    res.status(200).json({ message: "Category updated successfully" });
}
/** Update an image's details
 */
async function update_image(req, res) {
    const { category_id, image_id } = req.params;
    const updated_image_data = req.body; // Assuming updated data is sent in the body
    if (req.file?.filename) {
        updated_image_data.filename = req?.file?.filename; // Assuming file is uploaded
    }
    await gallery_service.update_image(category_id, image_id, updated_image_data);
    res.status(200).json({
        message: "Image updated successfully",
        ...(updated_image_data.filename && { image_name: updated_image_data.filename })
    });
}
/**
 * Delete a category with all its images
 */
async function delete_category(req, res) {
    const { category_id } = req.params;
    await gallery_service.delete_category(category_id);
    res.status(204).json();
}

/** Delete an image from a category
 */
async function delete_image(req, res) {
    const { category_id, image_id } = req.params;
    await gallery_service.delete_gallery_image(category_id, image_id);
    res.status(204).json();
}

export default {
    get_all_categories_and_images,
    add_category,
    add_image,
    update_category,
    update_image,
    delete_category,
    delete_image
}