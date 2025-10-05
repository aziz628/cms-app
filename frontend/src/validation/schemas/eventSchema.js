import * as yup from 'yup';
import {imageFileValidation,createChangeDetection} from "../validationRules"

const baseEventSchema = {
    title: yup.string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must be less than 100 characters'),
    description: yup.string()
      .min(3, 'Description must be at least 3 characters')
      .max(500, 'Description must be less than 500 characters'),
    date: //datetime format in data-T-time format
      yup.date().transform((value, originalValue) => {
        // If originalValue is a string, try to parse it
        return typeof originalValue === 'string'
          ? new Date(originalValue)
          : value;
      })
      .typeError('Please provide a valid date and time')
      .min(new Date(), 'Date must be in the future'),
    location: yup.string()
      .min(3, 'Location must be at least 3 characters')
      .max(100, 'Location must be less than 100 characters'),
};
export const createEventSchema = yup.object({
  title: baseEventSchema.title.required('Title is required'),
  description: baseEventSchema.description,
  date: baseEventSchema.date.required('Date is required'),
  location: baseEventSchema.location.required('Location is required'),
  image : imageFileValidation.required()
});
export const updateEventSchema = yup.object({
  ...baseEventSchema,
  image:imageFileValidation.optional()
}).test('hasChanges',
  'No changes detected',
  createChangeDetection([
    {name:"title"},
    {name:"description"},
    {name:"date" , type:"datetime-local"},
    {name:"location"},
    {name:"image",type:"file"},
  ]))