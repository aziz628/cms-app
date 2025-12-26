import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import App_error  from '../errors/AppError.js';
import { decrementStorage ,incrementStorage} from './upload_storage_state_service.js';

// reading data from json files

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_BASE = process.env.UPLOAD_BASE || 'uploads'; // default to 'uploads' if not set
const upload_dir = path.join(__dirname, '../', UPLOAD_BASE); 



/**
 * Save file content to disk at specified path
 * @param {string} filepath - Full path where to save the file
 * @param {Buffer} fileBuffer - File content buffer
 * @param {number} size - Size of the file in bytes
 * @returns {Promise<void>}
 * @throws {App_error} If file save fails
 */
async function save_file_to_disk(filepath, fileBuffer,size) {
    try {
        // Write file to disk
        await fs.writeFile(filepath, fileBuffer);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`File saved successfully to ${filepath}`);
        }
        // Update storage state
        incrementStorage(size);
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error(`Failed to save file to ${filepath}:`, error);
        }
        throw new App_error('Failed to save file', 500, 'SAVE_FILE_FAILED');
    }
}

// delete file from the image folder
async function delete_image(fileName, subfolder = '') {
  // subfolder is the folder name where the image is stored, like classes, trainers, gallery, events
  const filePath = path.join(upload_dir, subfolder, fileName);

  try {
    // to be replaced by multer file object in future
    const fileStats = await fs.stat(filePath);

    await fs.unlink(filePath)
    if(process.env.NODE_ENV === 'development') {
        console.log(`File ${fileName} deleted successfully`)
      }
    // Update storage state
    decrementStorage(fileStats.size); 
  } catch (error) {
    if(process.env.NODE_ENV === 'development') {
      console.error(`Failed to delete file ${fileName}:`, error)
    }
    throw new App_error('Failed to delete file', 500, 'DELETE_FILE_FAILED')
  }
}

export  {
  save_file_to_disk,
  delete_image
};