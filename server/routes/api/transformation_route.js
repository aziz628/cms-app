import express from "express"
import  {async_controller} from "../../utils/async_controller.js"
import transformation_controller from "../../controllers/transformation_controller.js"
import transformation_validator from "../../middleware/validators/transformation_validator.js"
import { create_upload_pipeline } from "../../middleware/file_middleware.js";

const router = express.Router()
const controller = async_controller(transformation_controller)
const {
    add_transformation_validator,
    update_transformation_validator,
    delete_transformation_validator
} = async_controller(transformation_validator)

// Define the pipeline for adding a transformation
const add_transformation_pipeline = create_upload_pipeline({
    validator: add_transformation_validator,
    section: "transformations",
    uploadMode: "fields",
    file_fields: ['before_image', 'after_image']
})

// Define the pipeline for updating a transformation
const update_transformation_pipeline = create_upload_pipeline({
    validator: update_transformation_validator,
    section: "transformations",
    uploadMode: "fields",
    file_fields: ['before_image', 'after_image']
});

// define the routes for transformation management
router.get("/", controller.get_all)
router.post("/", add_transformation_pipeline, controller.add_transformation)
router.put("/:id", update_transformation_pipeline, controller.update_transformation)
router.delete("/:id", delete_transformation_validator, controller.delete_transformation)

export default router