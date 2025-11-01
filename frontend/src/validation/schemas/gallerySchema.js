import * as yup from 'yup'
import { imageFileValidation, createChangeDetection } from '../validationRules'


const categoryBaseFields = {
  name: yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(30, 'Name must be less than 30 characters')
}
export const createCategorySchema = yup.object({
  name: categoryBaseFields.name.required('Name is required'),
})
export const updateCategorySchema = yup.object({
  ...categoryBaseFields,
}).test('hasChanges',
    'No changes detected',
    createChangeDetection([
      { name: "name" },
    ]))

const imageBaseFields = {
    name: yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(30, 'Name must be less than 30 characters'),
    description: yup.string()
        .min(3, 'Description must be at least 3 characters')
        .max(200, 'Description must be less than 200 characters'),

}
export const createImageSchema = yup.object({
    name: imageBaseFields.name.required('Name is required'),
    description: imageBaseFields.description.required('Description is required'),
    category_id: yup.number()
        .min(0, 'Category is required')
        .max(999999, 'Invalid category')
        .required('Category is required'),
    image: imageFileValidation.required()
})
export const updateImageSchema = yup.object({
    ...imageBaseFields,
    image: imageFileValidation.optional()
}).test('hasChanges',
    'No changes detected',
    createChangeDetection([
        { name: "name" },
        { name: "description" },
        { name: "image" ,type:"file" },
    ]))
