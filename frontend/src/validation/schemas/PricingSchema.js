import * as yup from "yup" 
import { createChangeDetection } from "../validationRules"
const pricing_plan_base_fields={
    name:yup.string()
    .min(3,"Name must be at least 3 characters")
    .max(50,"Name must be at most 50 characters"),
    description:yup.string()
    .max(255,"Description must be at most 255 characters")
    .nullable(),
    price:yup.number()
    .typeError("Price must be a number")
    .min(1,"Price must be at least 1")
    .max(1000000,"Price must be at most 1000000")
    .test(
        'is-decimal',
        'Price must be a decimal number',
        (value) => value === undefined || value === null || /^\d+(\.\d{1,2})?$/.test(value)
    ),
    period:yup.string()
    .oneOf(['daily', 'weekly', 'monthly', 'annually'],"Period must be one of: daily, weekly, monthly, annually")
}
export const createpricingPlanSchema=yup.object({
    name:pricing_plan_base_fields.name.required("Name is required"),
    description:pricing_plan_base_fields.description,
    price:pricing_plan_base_fields.price.required("Price is required"),
    period:pricing_plan_base_fields.period.required("Period is required"),
}).required()

export const updatepricingPlanSchema=yup.object(pricing_plan_base_fields).test('hasChanges',
    'No changes detected',
    createChangeDetection([
      { name: "name" },
      { name: "description" },
      { name: "price" },
      { name: "period"}
    ])) 

// plan feature 
/*
const add_feature_schema = joi.object({
    feature: joi.string().min(2).max(100).required()
}); */

const feature_base_fields={
    feature:yup.string()
    .min(2,"Feature must be at least 2 characters")
    .max(100,"Feature must be at most 100 characters")
}
export const addFeatureSchema=yup.object({
    feature:feature_base_fields.feature.required("Feature is required")
}).required()
export const updateFeatureSchema=yup.object(feature_base_fields).required()