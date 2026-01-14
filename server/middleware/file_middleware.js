import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import AppError from '../errors/AppError.js';
import { canAddFile ,getState,getAvailableStorage} from '../services/upload_storage_state_service.js';
import { save_file_to_disk } from '../services/content_service.js';
import { logWarning } from '../services/logging_service.js';

// file upload limits
const MAX_UPLOAD_FILES_PER_REQUEST = parseInt(process.env.MAX_UPLOAD_FILES_PER_REQUEST) || 2;
const DEFAULT_MAX_UPLOAD_SIZE = parseInt(process.env.DEFAULT_MAX_UPLOAD_SIZE) || 2 * 1024 * 1024; // 2MB
const MAX_TOTAL_STORAGE = parseInt(process.env.MAX_TOTAL_STORAGE) || 1000 * 1024 * 1024; // 1000MB

const ALLOWED_MIME_TYPES = ['image/jpeg',"image/jpg", 'image/png', 'image/gif', 'image/webp', 'image/avif'];

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// upload base dir's relative path to project root (different per env)
const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE || 'uploads';

// absolute path to uploads directory
const UPLOAD_DIR_PATH = path.join(__dirname, '../', UPLOAD_BASE_DIR);

// --- Pipeline Factory ---

     /**
      * Creates a standard file upload pipeline.
      * @param {object} options - The options for the pipeline.
      * @param {function} options.validator - The specific input validation middleware for the route.
      * @param {string} options.section - The folder name in 'uploads' to save files to.
      * @param {string} [options.uploadMode='single'] - The multer upload mode ('single' or 'fields').
      * @param {string} [options.field_name='image'] - The name of the file field for 'single' mode.
      * @param {string[]} [options.file_fields=['image']] - The names of the file fields for 'fields' mode.
      * @returns {Array} An array of middleware functions.
      */
function create_upload_pipeline(options={}) {
      const { 
        validator=(req,res,next)=>next(),
        section,
        uploadMode = 'single',
        file_fields = [],
        field_name = 'image'
      } = options;

      // section and input validator are required
      if(!section ){
        throw new Error('The "section" option is required.');
      }
      if (!validator ||  typeof validator !== 'function') {
        throw new Error('The "validator" option is required.');
      }

      // prepare the upload mode
      const memory_upload_options = {
        mode: uploadMode,
        ...(uploadMode === 'fields' ? { fields: file_fields } : { field_name }),
      };
      
      // prepare the file validator options
      const file_validator_options = {
        fields: uploadMode === 'fields' ? file_fields : [field_name]
      };
      
      return [
        memory_upload(memory_upload_options),
        post_upload_size_check,
        validator,  
        file_validator(file_validator_options),
        file_saver({ section })
      ];
    }
    
// --- Middleware 0: Memory Uploader ---

/**
 * Middleware to handle memory uploads.
 * @param {Object} options - Configuration options.
 * @param {string} [options.mode='single'] - Upload mode: 'single' or 'array'.
 * @param {string} [options.fieldName='image'] - The form field name for the file.
 * @param {number} [options.maxCount=5] - Maximum number of files for 'array' mode.
 * @param {number} [options.maxSize=2 * 1024 * 1024] - Maximum file size in bytes.
 * @param {Array} [options.allowedMimeTypes=['image/jpeg', 'image/png',
 * @returns {import('express').RequestHandler} Express middleware function.
 */

 function memory_upload(options = {}) {
  
  const {
    mode = 'single',
    field_name = 'image',
    fields = [],
    maxSize = DEFAULT_MAX_UPLOAD_SIZE,
    allowedMimeTypes = ALLOWED_MIME_TYPES
  } = options;

  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    // multer checks the file size when it collects the file chunks
    limits: { fileSize: maxSize , files: MAX_UPLOAD_FILES_PER_REQUEST },
    fileFilter: (req, file, cb) => {
      
      // Warn if storage is > 80% full
      const storageState = getState();
      if (storageState.totalSize > MAX_TOTAL_STORAGE * 0.8) {
          logWarning('Storage approaching limit', 507, req.originalUrl, 'POST', 
              `Used: ${storageState.totalSize}B, Limit: ${MAX_TOTAL_STORAGE}B, Available: ${getAvailableStorage()}B`);
      }
      // check mime type 
      if (!allowedMimeTypes.includes(file?.mimetype)) {
        return cb(new AppError(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`, 400, 'INVALID_FILE_TYPE'), false);
      }
      // Content-Length header presence
      const contentLength = parseInt(req.headers['content-length'], 10);
      if (!contentLength || contentLength <= 0) {
        return cb(new AppError('Content-Length header is required', 400, 'MISSING_CONTENT_LENGTH'), false);
      }
      // validate size using Content-Length to fail fast and skip multer collection of chunks (buffering)
      if(contentLength > maxSize){
        // same error as multer's built in file size exceeded
        return cb(new AppError('Uploaded file is too large', 413, 'FILE_TOO_LARGE'), false);
      }

      //  Validate against storage limit using Content-Length
      if (!canAddFile(contentLength)) {
        logWarning('Upload rejected - storage full', 413, req.originalUrl, 'POST',
            `Requested: ${contentLength}B, Available: ${getAvailableStorage()}B`);

            return cb(new AppError('Upload would exceed total storage limit', 413, 'STORAGE_LIMIT_EXCEEDED'), false);
      }
      // all checks passed , accept file
      cb(null, true);
    },
  });
  return mode === 'fields' ? upload.fields(fields.map(field => ({ name: field, maxCount: 1 }))) : upload.single(field_name);
}



// --- Middleware 1: Post Upload Size Check ---

/**
 *  Middleware to check total storage limit after file upload.
 * used against bypassing Content-Length header check in memory_upload middleware.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */

function post_upload_size_check(req, res, next) {
  //  request has no files 
  if(!(req.file || (req.files && Object.keys(req.files).length>0))) return next()

  // Get the uploaded files size from the request
  const uploadedFilesSize = req.file 
  ? req.file.size 
  : Object.values(req.files || {})
    .flat()
    .reduce((sum, f) => sum + (f?.size || 0), 0);

  // debugging the 0 size
  if (uploadedFilesSize==0){
    console.log(req.file || Object.keys(req.files))
  }  

  // Check header vs actual size mismatch
  const contentLength = parseInt(req.headers['content-length'], 10);
  if (contentLength && Math.abs(contentLength - uploadedFilesSize) > 1024) { // Allow 1KB tolerance
    return next(new AppError(
      'Actual file size differs from Content-Length header',
      400,
      'CONTENT_LENGTH_MISMATCH'
    ));
  }
  
  // Check if the upload would exceed the total storage limit
  if (!canAddFile(uploadedFilesSize)) {
    return next(new AppError('Upload would exceed total storage limit', 413, 'STORAGE_LIMIT_EXCEEDED'));
  }

  next();
}

// --- Middleware 2: File Presence Validator ---

/**
 * Creates a middleware to validate the presence of uploaded files in post and put requests.
 * Handles both single and multiple file fields.
 *
 * @param {Object} options
 * @param {Array<string>} [options.fields=['image']] - Array of required file field names.
 * @returns {import('express').RequestHandler}
 */
const file_validator = (options = {}) => {
  const { fields = ['image'] } = options;

  return (req, res, next) => {
    // Check for missing files
    let missingFiles = [];

    // Check for multiple fields (Multer .fields mode)
    if (req?.files) {
      
      // Check if each required field has a file
      for (const field of fields) {
        if (!req.files[field] || !req.files[field][0] || !req.files[field][0].buffer) {
          missingFiles.push(field);
        }
      }      
    // Single file (Multer .single mode)
    } else if (req.file) {
      if (!req.file.buffer) {
        missingFiles.push(fields[0]);
      }
    } else {
      // No files at all
      missingFiles = fields;
    }

    if (req.method === 'POST' ) {
      if (missingFiles.length > 0) {
        // log warning for missing files
          logWarning('Missing required file fields', 400, req?.originalUrl, 'POST',
        `Missing: ${missingFiles.join(', ')}, Expected: ${fields.join(', ')}`);
   
        return next(new AppError(`Files required: ${missingFiles.join(', ')}`, 400, 'FILE_REQUIRED'));
      }
    }
    else if (req.method === 'PUT' ) {
      const is_body_empty = Object.keys(req.body).length === 0;
      const noFilePresent = missingFiles.length === fields.length;
     
      if (is_body_empty && noFilePresent) {
        // log warning for empty update
        logWarning('Empty update request - no fields or files provided', 400, req?.originalUrl, 'PUT',
        `No fields or files provided for update. Expected at least one of: [${fields.join(', ')}] or body fields.`);
        return next(new AppError('At least one field or a file must be provided for an update.', 400, 'UPDATE_EMPTY'));
      }
    }

    next();
  };
};

// --- Middleware 3: File Saver ---

/**
 * Creates a middleware that saves uploaded files to disk
 * handle file saving for both single and multiple file uploads.
 *
 * @param {Object} options - Configuration options.
 * @param {string} options.section - The subdirectory within 'uploads' to save the file(s).
 * @returns {import('express').RequestHandler} Express middleware function.
 */
const file_saver = (options = {}) => {
  const { section } = options;
  if (!section) {
    throw new Error('A section must be provided to the file_saver middleware.');
  }

  return async (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    try {
      if (req?.files) {
        // Handle multiple files
         for (const field in req.files) {
          // Check if the field is an array (Multer .fields mode)
          if (Array.isArray(req.files[field])) {
            // in case of multiple files in a field
            for (let i = 0; i < req.files[field].length; i++) {
              req.files[field][i] = await save_file(req.files[field][i], section);
            }
          }
        }
      } else if (req?.file) {
        // Handle single file
        req.file = await save_file(req.file, section);
      }
      next();
    } catch (err) {
      console.error('Error saving file:', err);
      next(new AppError('Failed to save uploaded file', 500, 'FILE_SAVE_ERROR'));
    }
  };
};

/**
 * Renames a file ,  saves it to disk and updates the file object with new properties.
 * @param {Object} file - The file object from multer.
 * @param {string} section - The subdirectory within 'uploads' to save the file.
 * @returns {Promise<Object>} The updated file object.
 */
const save_file = async (file, section) => {
    // create a unique filename
    const unique_suffix = Math.floor(Math.random() * 1000);
    const filename = `${Date.now()}_${unique_suffix}${path.extname(file.originalname)}`;
    
    // join the upload directory with the section and filename
    const filepath = path.join(UPLOAD_DIR_PATH, section, filename);
    
    // write the file to disk
    await save_file_to_disk(filepath, file.buffer,file.size);
   
    // update the file object with new properties    
    file.filename = filename;
    file.path = filepath;
    file.buffer = null; // Free the file saved in memory sooner 
    return file;
    };

    
export { memory_upload, file_saver, file_validator ,post_upload_size_check,create_upload_pipeline, ALLOWED_MIME_TYPES}