import express from "express";
import { async_controller } from "../../utils/async_controller.js";
import  general_info_controller from "../../controllers/general_info_controller.js";

// validator
import general_info_validator  from "../../middleware/validators/general_info_validator.js";
const {about_summary_validator,
    create_business_hours_validator,
    update_business_hours_validator,
    delete_business_hour_validator} = async_controller(general_info_validator);
const controller = async_controller(general_info_controller);
const router = express.Router();

// Get general information
router.get("/", controller.get_info);
// Update routes for general information
router.put("/about-summary", about_summary_validator, controller.update_about_summary);
// add put delete
router.post("/business-hours", create_business_hours_validator, controller.create_business_hour);
router.put("/business-hours/:id", update_business_hours_validator, controller.update_business_hour);
router.delete("/business-hours/:id", delete_business_hour_validator, controller.delete_business_hour);

export default router;
