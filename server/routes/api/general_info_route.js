import express from "express";
import { wrap_all_async_functions } from "../../utils/async_controller.js";
import  general_info_controller from "../../controllers/general_info_controller.js";
import { create_upload_pipeline } from "../../middleware/file_middleware.js";
// validator
import general_info_validator  from "../../middleware/validators/general_info_validator.js";
const {
    create_business_hours_validator,
    update_business_hours_validator,
    delete_business_hour_validator,
    about_summary_validator,
    hero_title_validator,
    hero_subtitle_validator
} = wrap_all_async_functions(general_info_validator);

const controller = wrap_all_async_functions(general_info_controller);
const router = express.Router();

// Define the upload pipeline for updating about section image
const update_about_section_image_pipeline=create_upload_pipeline({
    section:"general_info",
    field_name:'about_image',
})
// Define the upload pipeline for updating hero image
const update_hero_section_image_pipeline=create_upload_pipeline({
    section:"general_info",
    field_name:'hero_image'
})

// Get general information
router.get("/", controller.get_info);

// Update routes for general information
router.put("/about-summary", about_summary_validator, controller.update_about_summary);
router.put("/about-image",update_about_section_image_pipeline,controller.update_about_image);
router.put("/hero-title", hero_title_validator, controller.update_hero_title);
router.put("/hero-subtitle", hero_subtitle_validator, controller.update_hero_subtitle);
router.put("/hero-image", update_hero_section_image_pipeline, controller.update_hero_image);

// business hour crud
router.post("/business-hours", create_business_hours_validator, controller.create_business_hour);
router.put("/business-hours/:id", update_business_hours_validator, controller.update_business_hour);
router.delete("/business-hours/:id", delete_business_hour_validator, controller.delete_business_hour);

export default router;
