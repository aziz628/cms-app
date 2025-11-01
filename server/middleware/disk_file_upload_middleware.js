
import multer from "multer";
import path from "path";
import App_error from "../errors/AppError.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname, "../", "uploads");

// Configure multer for file uploads
const storage = multer.diskStorage({
    // Destination for storing uploaded files
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    // Filename for uploaded files
    filename: (req, file, cb) => {
        // Generate a unique filename using the current timestamp and the original file 
        cb(null, `image_${Date.now()}${path.extname(file.originalname)}`);
    },
});

// File filter 
const fileFilter = (req, file, cb) => {
    // Check file MIME type
    console.log("File MIME type:", file.mimetype);  
    if (!file.mimetype.startsWith('image/')) {
        return cb(
            new App_error('Only image files are allowed!', 400, 'INVALID_FILE_TYPE'),
            false
        );
    }
    // Define and validate allowed extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif', '.bmp'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
        return cb(
            new App_error(
                `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
                400,
                'INVALID_FILE_TYPE'
            ),
            false
        );
    }
    cb(null, true);
};
const limits = {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    files: 10, // Limit number of files to 10
};
// create the multer upload instance with the storage and file filter 
// and limits with a single file upload field named "image"
const upload_middleware = multer({ storage, fileFilter, limits }).single("image");

export default upload_middleware;