import { useState,useEffect } from 'react';
import {getCurrentPage} from '../../utils/tools';

function FormBuilder({title,fields,initialData,validationMode,onSubmit,onClose,schema,useFormData = true}) {
  const [formData,setFormData] = useState(initialData || {});
  const [errors,setErrors] = useState({});
  const [previews,setPreviews] = useState({});
  const [initial_images,setInitialImages]= useState({});

 
  useEffect(() => {
      // Reset form data and errors when initialData or mode changes
    setFormData(initialData || {});
    setErrors({}); // Clear any previous errors

    // Set up initial previews from initialdata for file fields and format date fields
    if (validationMode === 'edit') {
      fields.forEach(field => {
        if (field.type === 'file' && initialData[field.name]) {
          const imageUrl = getUploadUrl(getCurrentPage(), initialData[field.name]);
          console.log('fetching : ', imageUrl)
          fetch(imageUrl)
                .then(response => response.blob())
                .then(blob => {
                   // Use FileReader instead of URL.createObjectURL
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setInitialImages(prev => ({...prev, [field.name]: e.target.result}));
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(err => {
                  console.error('Error loading initial image:', err);
                });
        }
      });
    } else {
      setInitialImages({});
    }
  }, [initialData, validationMode]); // Watch for changes in initialData or mode

  
  const validate = async () => {
    try {
      await schema.validate(formData, {
        abortEarly: false,
        context: { initialData }
      });
      setErrors({});
      return { isValid: true };
    } catch (err) {
       // Collect all validation errors
      const validationErrors = {};

      // First, check if we have any field-level errors
      const hasFieldErrors = err.inner?.some(error => error.path && error.path !== "");
      
      // Extract field-specific errors
      err.inner?.forEach(error => {
        if (error.type === 'hasChanges' && hasFieldErrors) {
          return; // Skip this error
        } if (error.path) {
          // for any field-specific error set the error message
          validationErrors[error.path] = error.message;
        } else {
          // for any other errors without specific field, set form error
          validationErrors.form = error.message;
        }
      });
      // If there are no field-specific errors, set the form-level error
      if(Object.keys(validationErrors).length === 0){
        validationErrors.form = err.message;
      }
      console.log(err?.inner)

      return { isValid: false, errors: validationErrors };
    }
  };
  const handleFileChange = (fieldName, e) => {
    const file = e?.target?.files?.[0];

    if (file) {
        // Validate file type if it's an image
        if (file.type.startsWith('image/') === false) {
            // Clear the input and show error
            e.target.value = ''; // Clear the file input visual value
            setFormData({...formData, [fieldName]: null});
            const updatedPreviews = {...previews};
            delete updatedPreviews[fieldName];
            setPreviews(updatedPreviews);
            setErrors({form: 'Please select a valid image file'});
            return;
        }
        
        setFormData({...formData, [fieldName]: file});

        
        // Use FileReader for preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviews({...previews, [fieldName]: event.target.result});
        };
        reader.readAsDataURL(file);
        setErrors({});
    } else {
       // No file selected
        setFormData({...formData, [fieldName]: null});
        const updatedPreviews = {...previews};
        delete updatedPreviews[fieldName];
        setPreviews(updatedPreviews);
    }
  }
  
  const handleSubmit = async (e) => {
    setErrors({}); // Clear previous errors
    e.preventDefault();
    const {isValid, errors=null} = await validate();
    if(!isValid) {
        setErrors(errors);
        return;
    }

    let ProcessedData = {...formData};

    if(validationMode === 'edit') {
        // only include changed fields
        const changedData = {};
        fields.forEach(field => {
          // For file fields, include if a new file is selected
            if (field.type === 'file') {
                if (formData[field.name] instanceof File) {
                    changedData[field.name] = formData[field.name];
                }
            }else if (field.type === 'datetime-local') {
                const initialDate = initialData[field.name] ? new Date(initialData[field.name]).getTime() : null;
                const currentDate = formData[field.name] ? new Date(formData[field.name]).getTime() : null;
                if (initialDate !== currentDate) {
                    changedData[field.name] = formData[field.name];
                }
            }
            // For other fields, include if value has changed 
            else if (ProcessedData[field.name] !== initialData[field.name]) {
                changedData[field.name] = ProcessedData[field.name];
            }
        });
        ProcessedData = changedData;
    }
    
    if(useFormData){
      let form = new FormData();
      // Append all fields to FormData
      Object.entries(ProcessedData).forEach(([key, value]) => {
        console.log('Appending to FormData:', key, typeof value, value);
        if (value instanceof File) {
          // For File objects
          form.append(key, value, value.name);
        } else if (value === null || value === undefined) {
          // Skip null/undefined values
          console.log('Skipping null/undefined value for:', key);
        } else if (typeof value === 'boolean') {
          // Explicitly convert boolean to string for clarity, though FormData.append would do this implicitly.
          form.append(key, value ? 'true' : 'false');
        } else if (fields.find(f => f.type === 'datetime-local' && f.name === key) && typeof value === 'string') {
          // If the field is a date type and value is a valid date string, convert to timestamp
          const timestamp = new Date(value).getTime();
          form.append(key, timestamp); // Use 'datetime' as the key for backend compatibility
        } else {
          // Everything else
          form.append(key, value);
        }
      });
      for (let pair of form.entries()) {
        console.log('formdata pair : ',pair[0]+ ', ' + pair[1]);
      }
      ProcessedData=form;
    }
    console.log('Final FormData to submit:', ProcessedData);
  
    onSubmit(ProcessedData);
  }
  return (
    <div className="p-4 shadow-md rounded-lg bg-white space-y-4 max-w-[800px] ">
      <h2 className="text-xl font-semibold">{title}</h2>
      {errors.form && (
          <div className="bg-red-100 bg-opacity-10 border-l-4 border-danger text-danger p-4">
            <p className="text-danger">{errors.form}</p>
          </div>
        )
      }
      <form onSubmit={handleSubmit} className="space-y-2 overflow-x-auto pr-2">
        {fields.map(field => (
          <div className={` ${field.type === 'checkbox' ? ' flex items-center space-x-2' : ''}`} key={field.name}>
            <label className="block mb-1 font-medium" htmlFor={field.name}>
              {field.label||field.name }{field.required && <span className={validationMode === 'create' ? 'text-danger' : 'text-warning'}> *</span>}
            </label>
            
            <FormField  field={field} value={formData[field.name]} 
            preview={
              field.type === 'file'
                ? (() => {
                    const url = previews?.[field.name] || initial_images[field.name];
                    if (!url) return null;
                    const isInitial = url   === initial_images[field.name];
                    return { url, isInitial };
                  })()
                : null
            }
              onChange={field.type === 'file' 
              ? handleFileChange
              : (value) => setFormData({...formData, [field.name]: value})} />
              
              {/* Display field-specific error */}
              {errors[field.name] && (
              <div className="bg-red-100 bg-opacity-10  text-danger  pb-2 ">
                <p className="text-danger">{errors[field.name]} <i class="fa-solid fa-circle-exclamation"></i></p>
              </div>
            )}
          </div>
        ))}
        <div style={{marginTop: "20px"}} className="flex space-x-2  ">
          <button type="submit" className="bg-primary hover:bg-hover-primary text-white px-4 py-2 rounded">
            {validationMode === 'create' ? 'Create' : 'Save Changes'}
          </button>
          <button type="button" onClick={onClose} className="bg-muted hover:bg-gray-400 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


function getUploadUrl(page, filename) {
  return `/uploads/${page}/${filename}`;
}

function FormField({field,value,onChange,preview=null}) {
    switch(field.type) {
      case 'text':
          return <input type="text"
          name={field.name}
          className="input" 
          placeholder={field.placeholder || ''}
          value={value} onChange={e => onChange(e.target.value)} ></input>
      case 'number':
          return <input name={field.name} type="number" className="input" value={value} onChange={e => onChange(e.target.value)} ></input>
      case 'checkbox':
        // it should return 0 or 1
          return <input id={field.name} 
          style={{ width: "20px", height: "20px" }}
          name={field.name}
          type="checkbox"
          className="input" checked={value} 
          onChange={e => onChange(e.target.checked)} ></input>
      case 'textarea':
          return <textarea name={field.name} className="input" cols={30} value={value} onChange={e => onChange(e.target.value)} ></textarea>
      case 'datetime-local':
          return <input name={field.name} type="datetime-local" className="input" value={value|| ''} onChange={e => onChange(e.target.value)} ></input>      
      case 'time':
          return <input name={field.name} type="time" className="input" value={value|| ''} onChange={e => onChange(e.target.value)} ></input>;
      case 'select':
          return (
              <select name={field.name} className="input" value={value} onChange={e => onChange(e.target.value)}>
                  {field.options.map(option => (
                      <option key={option.value} value={option.value}>
                          {option.label||option.value}
                      </option>
                  ))}
              </select>
          );
      case 'file':
          return (
            <div >
              {/* Custom file picker 
              <label htmlFor={field.name} className=" cursor-pointer">
                <span className="text-white  font-semibold bg-black p-2 rounded">Choose File</span>
              </label>
              */}
              <input name={field.name} id={field.name} type="file" className="input" accept="image/*"
                onChange={e => onChange(field.name,e)} ></input>
                
              {preview && <div className='flex'>
                <img src={preview.url} alt="Preview" className="rounded mt-2 w-24 h-24" />
               {!preview.isInitial && 
                <button style={{width:"fitcontent"}}
                      type='button'
                      onClick={() =>{
                        // Clear the file input then submit null to onChange
                        const fileInput = document.querySelector(`input[name="${field.name}"]`);
                        if (fileInput) {
                          fileInput.value = null;
                        }
                        onChange(field.name, null);
                      }}
                      className="ml-2 mt-2 px-2 h-[30px] flex items-center inline rounded text-white bg-danger  border-danger hover:border-red-700 hover:bg-red-700"
                      title="Remove file"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                  </button>
                }
              </div>
              }
            </div>
          )
      default:
            return null;
    }
}
export default FormBuilder;