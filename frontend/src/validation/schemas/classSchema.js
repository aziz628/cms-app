import * as yup from 'yup';
import { imageFileValidation, createChangeDetection } from '../validationRules.js';
// Base field definitions for classes
const baseClassFields = {
  name: yup.string()
    .min(3, 'Class name must be at least 3 characters')
    .max(100, 'Class name must be less than 100 characters'),
  description: yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  private_coaching: yup.boolean()
};

// Schema for creating a new class - all required fields
export const createClassSchema = yup.object({
  name: baseClassFields.name.required('Class name is required'),
  description: baseClassFields.description.required('Description is required'),
  private_coaching: baseClassFields.private_coaching.required(),
  image: imageFileValidation.required()
});

// Schema for updating a class - nothing required, but at least one change needed
export const updateClassSchema = yup.object({
  ...baseClassFields,
  image: imageFileValidation.optional()
}).test('hasChanges', 
  'No changes detected', 
  createChangeDetection([
  { name: 'name' },
  { name: 'description' },
  { name: 'private_coaching', type:'boolean' },
  { name: 'image', type: 'image' }
])
);


