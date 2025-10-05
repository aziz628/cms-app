import express from "express";
import { async_controller } from "../../utils/async_controller.js";
import gallery_controller from "../../controllers/gallery_controller.js";
import  gallery_validator from "../../middleware/validators/gallery_validator.js";
import {create_upload_pipeline} from "../../middleware/file_middleware.js";

const controller = async_controller(gallery_controller);
const router = express.Router();

const {
    add_category_validator,
    update_category_validator,
    add_image_validator,
    update_image_validator,
    delete_image_validator,
    delete_category_validator,
}=async_controller(gallery_validator);

const add_image_pipeline = create_upload_pipeline({
  validator: add_image_validator,
  section: "gallery",
  uploadMode: "single"
});

const update_image_pipeline = create_upload_pipeline({
  validator: update_image_validator,
  section: "gallery",
});

// Get all categories and images
router.get("/", controller.get_all_categories_and_images);
// Add a new category
router.post("/category", add_category_validator, controller.add_category);
// Update a category (name)
router.put("/category/:category_id", update_category_validator, controller.update_category);
// Delete a category (and all its images)
router.delete("/category/:category_id", delete_category_validator, controller.delete_category);
// Add an image to a category
router.post("/:category_id/image", add_image_pipeline, controller.add_image);
// Update image info (description, etc.)
router.put("/:category_id/image/:image_id", update_image_pipeline, controller.update_image);
// Delete an image from a category
router.delete("/:category_id/image/:image_id", delete_image_validator, controller.delete_image);

export default router;