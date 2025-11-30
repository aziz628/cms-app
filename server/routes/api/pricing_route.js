import express from "express";
import { wrap_all_async_functions } from "../../utils/async_controller.js";
import  pricing_controller from "../../controllers/pricing_controller.js";
import pricing_validator from "../../middleware/validators/pricing_validator.js";
import { pagination_validator } from "../../middleware/validators/pagination_validator.js";

const {
  add_pricing_validator,
  update_pricing_validator,
  add_feature_validator,
  update_feature_validator,
  delete_feature_validator,
  delete_pricing_validator
} = wrap_all_async_functions(pricing_validator);

// Wrap controller with async error handler
const controller = wrap_all_async_functions(pricing_controller);

const router = express.Router();

router.get("/", pagination_validator, controller.get_pricing_plans);
router.post("/", add_pricing_validator, controller.add_pricing_plan);

router.post("/:id/features", add_feature_validator, controller.add_feature);
router.put("/:id/features", update_feature_validator, controller.update_feature);
router.delete("/:id/features", delete_feature_validator, controller.delete_feature);

router.put("/:id", update_pricing_validator, controller.update_pricing_plan);
router.delete("/:id", delete_pricing_validator, controller.delete_pricing_plan);

export default router;
