import * as yup from "yup"
import {imageFileValidation,createChangeDetection} from "../validationRules"

const reviewBaseFields = {
    author:yup.string()
        .min(3, 'author must be at least 3 characters')
        .max(30, 'author must be less than 30 characters'),
    content:yup.string()
        .min(3, 'content must be at least 3 characters')
        .max(200, 'content must be less than 200 characters'),
    identity:yup.string().oneOf(['member', 'guest', ''])
}
export const createReviewSchema = yup.object({
    author:reviewBaseFields.author.required('Author is required'),
    content:reviewBaseFields.content.required('Content is required'),
    identity:reviewBaseFields.identity.optional(),
    image:imageFileValidation.required()
})

export const updateReviewSchema = yup.object({
    ...reviewBaseFields,
    image:imageFileValidation.optional()
}).test('hasChanges',
  'No changes detected',
  createChangeDetection([
    {name:"author"},
    {name:"content"},
    {name:"identity"},
    {name:"image",type:"file"},
  ]))
