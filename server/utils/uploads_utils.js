import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOAD_BASE = process.env.UPLOAD_BASE || 'uploads'; // Default to 'uploads' if not set
const UPLOADS_DIR = path.join(__dirname, '..',  UPLOAD_BASE);
const MAX_IMAGES_PER_CATEGORY = parseInt(process.env.MAX_IMAGES_PER_CATEGORY) || 10; // Default to 10 if not set

// Function to clean up excess images in time order  in each category based on 
export const cleanUpExcessImages = () => {
    const categories = ['gallery', 'trainers', 'events', 'reviews', 'transformations'];
    categories.forEach(category => {
        const dir = path.join(UPLOAD_BASE, category);
        const files = fs.readdirSync(dir);
        if (files.length > MAX_IMAGES_PER_CATEGORY) {
            // Sort files by creation date (oldest first) and delete excess
            const filesToDelete = files.sort((a, b) => {
                return fs.statSync(path.join(dir, a)).birthtime - fs.statSync(path.join(dir, b)).birthtime;
            }).slice(0, files.length - MAX_IMAGES_PER_CATEGORY);
            filesToDelete.forEach(file => {
                fs.unlinkSync(path.join(dir, file));
            });
        }
    });
};

/**
 * Remove all files under uploads/<subfolder>.
 * Use to reset the uploads
 */

export function cleanup_all_upload() {

  if (fs.existsSync(UPLOADS_DIR)) {
      console.log('Cleaning up uploads in folders ');
      // Remove everything
      fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });

      // remake the root folder
      fs.mkdirSync(UPLOADS_DIR);
      
      const subfolders= ['gallery', 'trainers', 'events', 'reviews', 'transformations'];
      // Recreate each folder
      subfolders.forEach(folder => {
          const folderPath = path.join(UPLOADS_DIR, folder);
          fs.mkdirSync(folderPath);
      });
}
}