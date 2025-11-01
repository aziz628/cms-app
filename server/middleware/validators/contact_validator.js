import { dynamic_validator,custum_joi as joi } from "../dynamic_validator_middleware.js";

// Social media validator with predefined platforms
const SUPPORTED_PLATFORMS = [
  'facebook',
  'instagram',
  'twitter',
  'youtube',
  'linkedin',
  'tiktok',
  'pinterest',
  'snapchat'
];

const socialMediaSchema ={
      platform: joi.string().valid(...SUPPORTED_PLATFORMS),
      link: joi.string().uri()
}
const add_social_media_link_schema = joi.object({
    platform: socialMediaSchema.platform.required(),
    link: socialMediaSchema.link.required()
});
const update_social_media_link_schema = joi.object(socialMediaSchema).min(1).required();


// Schema for address validation
const addressSchema = joi.object({
    address: joi.string().min(5).max(100).required()  
});


// Schema for phone validation
const phoneSchema = joi.object({
  // length of phone number need to be 8 digits
    phone_number: joi.number().min(10000000).max(99999999).required()
});

// Schema for email validation
const emailSchema = joi.object({
    email: joi.string().email().required()
});

//id_schema
const idSchema = joi.object({
    id: joi.number().min(1).required()
}).required();

const add_social_media_validator = dynamic_validator([add_social_media_link_schema]);
const update_social_media_validator = dynamic_validator([update_social_media_link_schema,idSchema]);
const delete_social_media_validator = dynamic_validator([null,idSchema]);
const address_validator = dynamic_validator([addressSchema]);
const phone_validator = dynamic_validator([phoneSchema]);
const email_validator = dynamic_validator([emailSchema]);

export default {
  add_social_media_validator,
  update_social_media_validator,
  delete_social_media_validator,
  address_validator,
  phone_validator,
  email_validator
};
