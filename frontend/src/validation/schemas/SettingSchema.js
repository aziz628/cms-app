import *  as yup from "yup";

export const usernameSchema = yup.object({
  username: yup.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .required('Username is required'),
});
export const passwordSchema = yup.object({
  password: yup.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .required('Password is required'),
});
