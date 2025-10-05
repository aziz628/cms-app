import express from "express";
import { async_controller } from "../../utils/async_controller.js";
import  events_controller  from "../../controllers/events_controller.js";
import event_validator from "../../middleware/validators/event_validator.js";
import { create_upload_pipeline } from "../../middleware/file_middleware.js";

const router = express.Router();
const controller = async_controller(events_controller);
const {
    add_event_validator,
    update_event_validator,
    delete_event_validator
} = async_controller(event_validator);

const add_event_pipeline = create_upload_pipeline({
    validator: add_event_validator,
    section: "events"
});

const update_event_pipeline = create_upload_pipeline({
    validator: update_event_validator,
    section: "events"
})

// Define routes
router.get("/", controller.get_all_events);
router.post("/", add_event_pipeline, controller.create_event);
router.put("/:id", update_event_pipeline, controller.update_event);
router.delete("/:id", delete_event_validator, controller.delete_event);

export default router;