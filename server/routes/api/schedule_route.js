import express from "express";
import { async_controller } from "../../utils/async_controller.js";
import raw_schedule_controller from "../../controllers/schedule_controller.js"
import schedule_validator from "../../middleware/validators/schedule_validator.js";
const {
  add_session_validator,
  update_session_validator,
  delete_session_validator
} = async_controller(schedule_validator);
const schedule_controller = async_controller(raw_schedule_controller);
const router = express.Router();

router.get("/", schedule_controller.get_schedule);
// Protect all routes with session authentication
router.post("/", add_session_validator, schedule_controller.add_session);
router.put("/:id", update_session_validator, schedule_controller.update_session);
router.delete("/:id", delete_session_validator, schedule_controller.delete_session);

export default router;