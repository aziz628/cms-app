import * as yup from 'yup';
import { imageFileValidation, createChangeDetection } from '../validationRules.js';

const baseTransformationFields = {
    name: yup.string()
        .min(3,'Name must be at least 3 characters')
        .max(100,'Name must be less than 100 characters'),
    description: yup.string()
        .min(3,'Description must be at least 3 characters')
        .max(500,'Description must be less than 500 characters'),
}
export const createTransformationSchema = yup.object({
    name: baseTransformationFields.name.required('Name is required'),
    description: baseTransformationFields.description.required('Description is required'),
    before_image: imageFileValidation.required('Before image is required'),
    after_image: imageFileValidation.required('After image is required'),
});
export const updateTransformationSchema = yup.object({
    ...baseTransformationFields,
    before_image: imageFileValidation.optional('before_image'),
    after_image: imageFileValidation.optional('after_image')
}).test('hasChanges',
    'No changes detected',
    createChangeDetection([
        {name:'name'},
        {name:'description'},
        {name:'before_image',type:'file'},
        {name:'after_image',type:'file'}
    ])
);