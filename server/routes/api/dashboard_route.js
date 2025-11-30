import express from "express";
import { async_handler } from "../../utils/async_controller.js";
import get_dashboard from "../../controllers/dashboard_controller.js";
import { pagination_validator } from "../../middleware/validators/pagination_validator.js";

const router = express.Router();

// dashboard route with pagination validation
router.get("/", pagination_validator, async_handler(get_dashboard));

export default router;