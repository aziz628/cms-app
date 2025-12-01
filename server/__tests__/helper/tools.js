import '../../config/load_env.js';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import app from '../../app.js';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RELATIVE_FIXTURES_DIR = "__tests__/fixtures";

const UPLOAD_BASE =  '__tests__/uploads';
const UPLOADS_DIR = path.join(__dirname, '..', '..', UPLOAD_BASE);
const fixture_images= ['testing_image.jpg', 'testing_image2.webp', 'testing_image3.jpg',"testing_image4.jpg"];

/**
  * Return a relative path to a fixture image and with each number, return a different image. 
  * @param {number} [number=0] - The fixture number (0-based index, default is zero).
  * @returns {string} The relative path to the fixture file.
  * @throws {Error} If the fixture number is out of range.
  */
export function get_fixture_image(number=0) {
    if (number < 0 || number >= fixture_images.length) {
      throw new Error(`fixture_file: invalid fixture number ${number}`);
    }
    return path.join(RELATIVE_FIXTURES_DIR, fixture_images[number]);
}

/**
 * Get the size of a fixture image file in bytes.
 * @param {number} [number=0] - The fixture number (0-based index, default is zero).
 * @returns {number} The size of the fixture file in bytes.
 * @throws {Error} If the fixture number is out of range.
 * */
export function get_fixture_image_size(number=0) {
    const root_relative_fixturePath = get_fixture_image(number);
    const absolute_fixturePath = path.join(__dirname, '..', '..', root_relative_fixturePath);
    const stats = fs.statSync(absolute_fixturePath);
    return stats.size;
}


// Helper: Generate large test file
export async function createLargeTestFile(sizeBytes) {
  const filepath = path.join(__dirname,'../../', RELATIVE_FIXTURES_DIR, 'large_file.png');

  // Write zeros in chunks (faster than single write)
  const chunkSize = 10 * 1024 * 1024; // 10MB chunks
  const chunks = Math.ceil(sizeBytes / chunkSize); // total number of chunks
  const zeroBuffer = Buffer.alloc(chunkSize, 0); // buffer of zeros
  
  const stream = fs.createWriteStream(filepath); // create write stream
  
  for (let i = 0; i < chunks; i++) {
    // determine how much to write in this chunk
    const toWrite = i === chunks - 1 
      ? sizeBytes - (i * chunkSize)
      : chunkSize;

    if (toWrite === chunkSize) {
      stream.write(zeroBuffer);
    } else {
      stream.write(Buffer.alloc(toWrite, 0));
    }
  }

  // return a promise that resolves when done
  return new Promise((resolve, reject) => {
    // finalize the write
    stream.end();
    // return a promise that resolves when done
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}



/**
 * Check if an uploaded file exists in the uploads directory and is being served through the API.
 * @param {string} subfolder - The subfolder under uploads (e.g., 'gallery', 'events').
 * @param {string} filename - The name of the file to check.
 * @returns {boolean} True if the file exists, false otherwise.
 */
export function ensure_uploaded_file_exist(subfolder="",filename) {
  const filePath = path.join(UPLOADS_DIR, subfolder, filename);
  const exists = fs.existsSync(filePath);

  // If the file exists, do a request to ensure it is served
  if (exists) {
    const urlPath = `/uploads/${subfolder}/${filename}`
    request(app)
      .get(urlPath)
      .then(res => {
        // check for 200 status
        if (res.statusCode !== 200) {
          console.error(`File ${urlPath} exists on disk but not served (status=${res.statusCode})`);
        }
        // see if the file served is same size as on disk
        const contentLength = parseInt(res.headers['content-length'], 10);
        const stats = fs.statSync(filePath);
        
        if (Math.abs(contentLength - stats.size) > 1024) { // allow 1KB difference for encoding
          console.error(`File ${urlPath} size mismatch: served ${contentLength} bytes, on disk ${stats.size} bytes`);
        }
      });
  }
  return exists;
}

/**
 * Check that no files in the fixtures list exist in the uploads/<subfolder> directory.
 * Logs an error message for each file that still exists.
 * @param {string} subfolder - The subfolder under uploads (e.g., 'gallery', 'events').
 * @returns {boolean} True if no files exist, false if any files are found.
 */
export  function check_no_file_in_uploads(subfolder) {
  for (const filename of fixture_images) {
    // build the full path to the file
    const filePath = path.join(UPLOADS_DIR, subfolder, filename);
    
    // check if the file still exists
    if (fs.existsSync(filePath)) {
      return false;
    }

  }
  return true;
}

/**
 * Return a fixture path that represents an invalid file (for negative tests).
 */
export function invalid_fixture_image() {
  return path.join(RELATIVE_FIXTURES_DIR, 'invalid_file.txt');
}

/**
  * Login and return authentication cookies.
  * Default credentials are for the initial admin user created in migration.
 */
export async function getAuthCookies(credentials = { username: 'admin', password: 'admin_password' }) {
  const res = await request(app)
    .post('/api/auth/login')
    .send(credentials);

  if (!res || res.statusCode !== 200) {
    console.error(`getAuthCookies: login failed (status=${res?.statusCode}) and res body ${res?.body} for the credentials ${JSON.stringify(credentials)}`);
  }

  return res.headers['set-cookie'];
}

/**
 * Remove all files under uploads/<subfolder>.
 * Used in afterAll to cleanup files created by tests.
 */

export function cleanup_all_upload() {

  if (fs.existsSync(UPLOADS_DIR)) {
      console.log('Cleaning up uploads directory...');
      const folders = ['gallery', 'trainers', 'events', 'reviews', 'classes', 'transformations','general_info'];

      // check if  files stayed in uploads
      folders.forEach(folder => {
          const folderPath = path.join(UPLOADS_DIR, folder);

          if (fs.existsSync(folderPath)) {
              const real_files = get_uploaded_files_in_subfolder(folderPath);

              if (real_files.length > 0) {
                  console.error(` - Found ${real_files.length} files in ${folder} after tests: ${real_files.join(', ')}`);
              }
          }
      });

      // Remove everything
      fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
        
     

      // remake the root folder
      fs.mkdirSync(UPLOADS_DIR);

      // Recreate each subfolder
      folders.forEach(folder => {
          const folderPath = path.join(UPLOADS_DIR, folder);
          fs.mkdirSync(folderPath);
          
          // add gitkeep file to each folder
          fs.writeFileSync(path.join(folderPath, '.gitkeep'), '');
      });
}
}

// get files names un a subfolder filtering .gitkeep
export function get_uploaded_files_in_subfolder(folder_path) {
  return fs.readdirSync(folder_path).filter(file => file !== '.gitkeep');
}

/**
 * Ensure the uploads subfolder exists and return its path.
 */
export function cleanup_upload_subfolder(subfolder) {
  const target = path.join(UPLOADS_DIR, subfolder);
  if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
  }
  fs.mkdirSync(target, { recursive: true });
}

