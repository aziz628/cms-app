import * as yup from 'yup';
import { imageFileValidation, createChangeDetection } from '../validationRules.js';
// Base field definitions for trainers

// trainers schema values : name, speciality, certificate, years_of_experience

const baseTrainerFields = {
    name: yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
    speciality: yup.string()
    .min(3, 'Speciality must be at least 3 characters')
    .max(100, 'Speciality must be less than 100 characters'),
    certificate: yup.string()
    .min(3, 'Certificate must be at least 3 characters')
    .max(100, 'Certificate must be less than 100 characters'),
    years_of_experience: yup.number()
    .min(0, 'Years of experience must be at least 0')
    .required('Years of experience is required'),
};
// Schema for creating a new trainer - all required fields
export const createTrainerSchema = yup.object({
  name: baseTrainerFields.name.required('Name is required'),
  speciality: baseTrainerFields.speciality.required('Speciality is required'),
  certificate: baseTrainerFields.certificate.required('Certificate is required'),
  years_of_experience: baseTrainerFields.years_of_experience.required('Years of experience is required'),
  image: imageFileValidation.required('Image is required')
});
// Schema for updating a trainer - nothing required, but at least one change needed
export const updateTrainerSchema = yup.object({
    ...baseTrainerFields,
    image: imageFileValidation.optional()
}).test('hasChanges',
  'No changes detected',
  createChangeDetection([
    { name: 'name' },
    { name: 'speciality' },
    { name: 'certificate' },
    { name: 'years_of_experience' },
    { name: 'image', type: 'image' }
  ])
);