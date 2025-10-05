import express from "express";
import { async_controller } from "../../utils/async_controller.js";
import trainers_controller from "../../controllers/trainers_controller.js";
import trainers_validator from "../../middleware/validators/trainers_validator.js";
import { create_upload_pipeline } from "../../middleware/file_middleware.js";

const controller = async_controller(trainers_controller);
const router = express.Router();

const {
  add_trainer_validator,
  update_trainer_validator,
  delete_trainer_validator
} = async_controller(trainers_validator);

const add_trainer_pipeline = create_upload_pipeline({
  validator: add_trainer_validator,
  section: "trainers",
});

const update_trainer_pipeline = create_upload_pipeline({
  validator: update_trainer_validator,
  section: "trainers",
});

// Define routes
router.get("/", controller.get_trainers);
router.post("/", add_trainer_pipeline, controller.add_trainer);
router.put("/:id", update_trainer_pipeline, controller.update_trainer);
router.delete("/:id", delete_trainer_validator, controller.delete_trainer);

export default router;
