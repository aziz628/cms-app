import express from "express"
import { async_controller } from "../../utils/async_controller.js"
import review_controller from "../../controllers/review_controller.js"
import review_validator from "../../middleware/validators/review_validator.js"
import { create_upload_pipeline } from "../../middleware/file_middleware.js";

const {
    add_review_validator,
    update_review_validator,
    delete_review_validator
} = async_controller(review_validator)

const controller = async_controller(review_controller)
const router = express.Router()


// Define the pipeline for adding a review
const add_review_pipeline = create_upload_pipeline({
    validator: add_review_validator,
    section: "reviews"
});

// Define the pipeline for updating a review
const update_review_pipeline = create_upload_pipeline({
    validator: update_review_validator,
    section: "reviews"
});

// Define routes for review management
router.get("/", controller.get_reviews)
router.post("/", add_review_pipeline, controller.add_review)
router.put("/:id", update_review_pipeline, controller.update_review)
router.delete("/:id", delete_review_validator, controller.delete_review)

export default router