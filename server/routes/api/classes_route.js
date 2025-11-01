import express from "express";
import {async_controller } from "../../utils/async_controller.js"
import class_controller from "../../controllers/classes_controller.js";
import class_validators from "../../middleware/validators/class_validator.js";
import memory_monitor from "../../middleware/memory_monitor.js";
import { create_upload_pipeline } from "../../middleware/file_middleware.js";

const {
  create_class_validator,
  update_class_validator,
  delete_class_validator,
} = async_controller(class_validators);

const add_class_pipeline = create_upload_pipeline({
  validator: create_class_validator,
  section: "classes",
})

const update_class_pipeline = create_upload_pipeline({
  validator: update_class_validator,
  section: "classes",
})

const classes_controller = async_controller(class_controller);
const router = express.Router();

router.get("/", classes_controller.get_all_classes);
// Add a new class, including an image upload.
router.post("/", memory_monitor, add_class_pipeline, classes_controller.add_class);

// Update an existing class, including an image upload.
router.put("/:id", memory_monitor, update_class_pipeline, classes_controller.update_class);

router.delete("/:id", delete_class_validator, classes_controller.delete_class);

export default router;