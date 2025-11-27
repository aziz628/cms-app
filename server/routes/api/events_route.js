import express from "express";
import { wrap_all_async_functions } from "../../utils/async_controller.js";
import  events_controller  from "../../controllers/events_controller.js";
import event_validator from "../../middleware/validators/event_validator.js";
import { create_upload_pipeline } from "../../middleware/file_middleware.js";

const router = express.Router();
const controller = wrap_all_async_functions(events_controller);
const {
    add_event_validator,
    update_event_validator,
    delete_event_validator
} = wrap_all_async_functions(event_validator);

// Define upload pipeline for adding an event
const add_event_pipeline = create_upload_pipeline({
    validator: add_event_validator,
    section: "events"
});

// Define upload pipeline for updating an event
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