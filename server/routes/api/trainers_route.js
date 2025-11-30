import express from "express";
import { wrap_all_async_functions } from "../../utils/async_controller.js";
import trainers_controller from "../../controllers/trainers_controller.js";
import trainers_validator from "../../middleware/validators/trainers_validator.js";
import { pagination_validator } from "../../middleware/validators/pagination_validator.js";

import { create_upload_pipeline } from "../../middleware/file_middleware.js";

const controller = wrap_all_async_functions(trainers_controller);
const router = express.Router();

const {
  add_trainer_validator,
  update_trainer_validator,
  delete_trainer_validator
} = wrap_all_async_functions(trainers_validator);

// Define upload pipeline for adding a trainer
const add_trainer_pipeline = create_upload_pipeline({
  validator: add_trainer_validator,
  section: "trainers",
});

// Define upload pipeline for updating a trainer
const update_trainer_pipeline = create_upload_pipeline({
  validator: update_trainer_validator,
  section: "trainers",
});

// Define routes
router.get("/", pagination_validator, controller.get_trainers);
router.post("/", add_trainer_pipeline, controller.add_trainer);
router.put("/:id", update_trainer_pipeline, controller.update_trainer);
router.delete("/:id", delete_trainer_validator, controller.delete_trainer);

export default router;
