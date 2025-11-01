import * as yup from "yup";
import {createChangeDetection} from "../validationRules"


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

const BaseSocialMedia = yup.object({
    platform: yup.string().oneOf(SUPPORTED_PLATFORMS, 'Invalid social media platform'),
    link: yup.string().url('Please provide a valid URL')
});

export const addSocialMediaSchema = yup.object({
    platform: BaseSocialMedia.fields.platform.required('Platform is required'),
    link: BaseSocialMedia.fields.link.required('Link is required')
});

export const updateSocialMediaSchema = yup.object(BaseSocialMedia.fields).test(
  'hasChanges',
  'No changes detected',createChangeDetection([
    {name:"platform"},
    {name:"link"},
  ])
);
export const locationSchema = yup.object({
    address: yup.string()
    .min(5, "Location Address must be at least 5 characters")
    .max(100, "Location Address cannot exceed 100 characters")
    .required("Location Address is required")
});


// Schema for phone validation
export const phoneSchema = yup.object({
    phone_number: yup.string()
    .matches(/^[0-9]+$/, "Phone number must be numeric")
    .length(8, "Phone number must be exactly 8 digits")
    .required("Phone number is required")
});

// Schema for email validation
export const emailSchema = yup.object({
    email: yup.string()
    .email("Invalid email format")
    .required("Email is required")
});

