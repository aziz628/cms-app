import express from "express";
import { async_controller } from "../../utils/async_controller.js";
import  contact_controller from "../../controllers/contact_controller.js";
// validator
import contact_validators from "../../middleware/validators/contact_validator.js";
const {
  add_social_media_validator,
  update_social_media_validator,
  delete_social_media_validator,
  address_validator,
  phone_validator,
  email_validator
} = async_controller(contact_validators);

const controller = async_controller(contact_controller);
const router = express.Router();

// Define routes for contact information
router.get("/", controller.get_info);

router.post("/social-media", add_social_media_validator, controller.create_social_media_link);
router.put("/social-media/:id", update_social_media_validator, controller.update_social_media);
router.delete("/social-media/:id", delete_social_media_validator, controller.delete_social_media);

router.put("/address", address_validator, controller.update_address);
router.put("/phone_number", phone_validator, controller.update_phone_number);
router.put("/email", email_validator, controller.update_email);


export default router;