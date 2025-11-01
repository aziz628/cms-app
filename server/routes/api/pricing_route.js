import express from "express";
import { async_controller } from "../../utils/async_controller.js";
import  pricing_controller from "../../controllers/pricing_controller.js";
import pricing_validator from "../../middleware/validators/pricing_validator.js";
const {
  add_pricing_validator,
  update_pricing_validator,
  add_feature_validator,
  update_feature_validator,
  delete_feature_validator,
  delete_pricing_validator
} = async_controller(pricing_validator);
// Wrap controller with async error handler
const controller = async_controller(pricing_controller);

const router = express.Router();

router.get("/", controller.get_pricing_plans);
router.post("/", add_pricing_validator, controller.add_pricing_plan);

router.post("/:id/features", add_feature_validator, controller.add_feature);
router.put("/:id/features", update_feature_validator, controller.update_feature);
router.delete("/:id/features", delete_feature_validator, controller.delete_feature);

router.put("/:id", update_pricing_validator, controller.update_pricing_plan);
router.delete("/:id", delete_pricing_validator, controller.delete_pricing_plan);

export default router;
