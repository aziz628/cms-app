import express from "express";
import { wrap_all_async_functions } from "../../utils/async_controller.js";
import gallery_controller from "../../controllers/gallery_controller.js";
import  gallery_validator from "../../middleware/validators/gallery_validator.js";
import {create_upload_pipeline} from "../../middleware/file_middleware.js";
import { pagination_validator } from "../../middleware/validators/pagination_validator.js";

const controller = wrap_all_async_functions(gallery_controller);
const router = express.Router();

const {
    add_category_validator,
    update_category_validator,
    add_image_validator,
    update_image_validator,
    delete_image_validator,
    delete_category_validator,
}=wrap_all_async_functions(gallery_validator);

// Define the upload pipeline for adding an image
const add_image_pipeline = create_upload_pipeline({
  validator: add_image_validator,
  section: "gallery",
  uploadMode: "single"
});

// Define the upload pipeline for updating an image
const update_image_pipeline = create_upload_pipeline({
  validator: update_image_validator,
  section: "gallery",
});

// category crud routes

// get all categories with their images
router.get("/", pagination_validator, controller.get_all_categories_and_images);
router.post("/category", add_category_validator, controller.add_category);
router.put("/category/:category_id", update_category_validator, controller.update_category);
router.delete("/category/:category_id", delete_category_validator, controller.delete_category);

// image crud routes
router.post("/:category_id/image", add_image_pipeline, controller.add_image);
router.put("/:category_id/image/:image_id", update_image_pipeline, controller.update_image);
router.delete("/:category_id/image/:image_id", delete_image_validator, controller.delete_image);

export default router;