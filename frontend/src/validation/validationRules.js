import * as yup from 'yup';

// Reusable validation rules for files
export const imageFileValidation = {
  required: (message='Image is required') => 
    yup.mixed()
      .required(message)
      .test('fileType', 'Please upload a valid image file', (value) => {
        if (!value) return true; // Skip this test if no value (the required() will catch it)
        return value instanceof File && value.type.startsWith('image/');
      }),
  optional: (imagename='image') =>
    yup.mixed()
      .nullable() // Add this to explicitly allow null values
      .test('fileType', 'Please upload a valid image file', function(value)  {
        const initialData = this.options.context?.initialData || {};
        if (!value || value == initialData[imagename]) return true; // Skip for no value or string URLs
        return value instanceof File && value.type.startsWith('image/');
      })
};

export const createChangeDetection = (fields) => {
  return function(values) {
    // Access initial data from context
    const initialData = this.options.context?.initialData || {};
    
    // Check each field for changes
    for (const field of fields) {
      const { name, type=null } = field;
      
      if (type === 'file' || type === 'image') {
        // For file/image fields - detect if a new file was provided
        if (values[name] instanceof File) {
          return true; // New file uploaded - change detected
        }
      }else if (type === 'boolean') {
        // Handle boolean values specifically - convert to boolean for comparison
        const initialValue = Boolean(initialData[name]);
        const currentValue = Boolean(values[name]);
        if (initialValue !== currentValue) {
          return true;
        }
      }else if (type === 'datetime-local' ) {
        // For date fields - compare timestamps
        const initialValue = initialData[name];
        const currentValue = values[name];
        
        // Skip comparison if both are null/undefined
        if (!initialValue && !currentValue) {
          continue;
        }
        // compare as Date objects
          const initialDate = new Date(initialValue);
          const currentDate = new Date(currentValue);
          if (initialDate.getTime() !== currentDate.getTime()) {
            return true; // Date changed
          }
      } else {
        // For other fields - direct comparison
        let initialValue = initialData[name];
        // Normalize undefined values to empty string for comparison (edge case)
        if (initialValue === undefined) initialValue = '';

        let newValue = values[name];
        if (initialValue !== newValue) {
          return true; // Change detected
        }
      }
    }

    return false; // No changes detected
  };
}