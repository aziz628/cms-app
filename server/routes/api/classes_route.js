import express from "express";
import {wrap_all_async_functions } from "../../utils/async_controller.js"
import class_controller from "../../controllers/classes_controller.js";
import class_validators from "../../middleware/validators/class_validator.js";
import { create_upload_pipeline } from "../../middleware/file_middleware.js";

const {
  create_class_validator,
  update_class_validator,
  delete_class_validator,
} = wrap_all_async_functions(class_validators);

// Define the upload pipeline for adding a class
const add_class_pipeline = create_upload_pipeline({
  validator: create_class_validator,
  section: "classes",
})

// Define the upload pipeline for updating a class
const update_class_pipeline = create_upload_pipeline({
  validator: update_class_validator,
  section: "classes",
})

const classes_controller = wrap_all_async_functions(class_controller);
const router = express.Router();

router.get("/", classes_controller.get_all_classes);
// Add a new class, including an image upload.
router.post("/", add_class_pipeline, classes_controller.add_class);

// Update an existing class, including an image upload.
router.put("/:id", update_class_pipeline, classes_controller.update_class);

router.delete("/:id", delete_class_validator, classes_controller.delete_class);

export default router;