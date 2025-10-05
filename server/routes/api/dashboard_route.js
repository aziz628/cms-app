// import modules
import express from "express";
import { async_handler } from "../../utils/async_controller.js";
import get_dashboard from "../../controllers/dashboard_controller.js";
import { dashboard_validator } from "../../middleware/validators/dashboard_validator.js";
// declare variables 
const router = express.Router();

// define routes
router.get("/", dashboard_validator, async_handler(get_dashboard));

export default router;