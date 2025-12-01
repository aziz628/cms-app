import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Setup ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// upload base dir's relative path to project root (different per env)
const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE || 'uploads';

// absolute path to uploads directory
const UPLOAD_DIR_PATH = path.join(__dirname, '../', UPLOAD_BASE_DIR);
const MAX_TOTAL_STORAGE = parseInt(process.env.MAX_TOTAL_STORAGE) || 1 * 1024 * 1024 * 1024; // 1GB

const STORAGE_STATE_FILE = path.join(__dirname, '../',
  process.env.NODE_ENV== 'test' ? '__tests__' : '',
   'data/storage-state.json');


// In-memory state (default values)
let storageState = {
  totalSize: 0, // in bytes
  lastUpdated: new Date().toISOString()
};


// Queue for writes
const writeQueue = [];
let locked = false;

/**
 * Process the queue objects one at a time
 * Each object contains an operation (async function) and its associated resolver/rejector
 * after processing an item, it recall itself to process the rest of the queue 
 */
async function processQueue() {
  // If locked , exit and wait for the queue to reach the object containing the resolver
  if (locked ) {
    return;
  }
  // Lock the queue
  locked = true;
  const { storage_writing_operation, resolve, reject } = writeQueue.shift();

  try {
    // Execute the operation and resolve the promise
    await storage_writing_operation();
    resolve();
  } catch (error) {
    // If an error occurs, reject the promise
    console.error(' Queue operation failed:', error);
    reject(error);
  } finally {
    // after operation complete, unlock the queue
    locked = false;

    // Process next item in the queue if any
    if (writeQueue.length > 0) {
      processQueue();
    }
  }
}

/**
 * Initializes storage state from disk
 * creates new state file data is invalid/missing
 */
async function initialize_storage_state() {
  try {
    // Load existing state
    const data = await fs.readFile(STORAGE_STATE_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // if parsed data is missing fields then it's invalid
    if (typeof parsed.totalSize !== 'number' || typeof parsed.lastUpdated !== 'string') {
      // INVALID_STATE error will trigger creation of new file
      throw { code: 'INVALID_STATE' };
    } 
    // Set in-memory state
    storageState = parsed;
    console.log(' Storage state loaded:', parsed);
    
  } catch (error) {
    // create new state file if missing or invalid
    if (error.code === 'ENOENT' || error.code === 'INVALID_STATE') {
      console.log(' Storage state file missing or invalid, creating new one.');
      await createNewStateFile();
    } 
    else {
      console.error(' Error loading storage state:', error);
      throw error;
    }
  }
}

/**
 * Creates a new storage state file with initial values
 */
async function createNewStateFile() {
  console.log(' Creating new storage state file');

  // Calculate current uploads directory size 
  const uploads_size = await getDirectorySize();

  // Initialize state
  storageState = {
    totalSize: uploads_size,
    lastUpdated: new Date().toISOString()
  };
  // Save to file
  await saveToFile();
}

/**
     * Recursively calculates the total size of all files within the uploads directory.
     *
     * For each item in the directory:
     * - If the item is a file, its size is added to the total.
     * - If the item is a subdirectory, the function calls itself on that subdirectory and adds the returned size to the total.
     *
     * @async
     * @returns {Promise<number>} The total size of all files in bytes.
    */
  const getDirectorySize = async (directory=UPLOAD_DIR_PATH) => {
    let totalSize = 0;
    // Read all items in the directory
    const files = await fs.readdir(directory);

    for (const file of files) {
      try {
        // get the file stats
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);

        // If it's a directory, recurse into it
        if (stats.isDirectory()) {
          totalSize += await getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      } catch (err) {
        console.error(`Error accessing file ${file}:`, err);
      }
    }
    return totalSize;
  };

/**
 * Gets current storage state (instant read)
 */
function getState() {
    return { ...storageState }; // Return a copy to prevent external mutation
}

/**
 * Returns the remaining available storage in bytes.
 */
function getAvailableStorage() {
  return MAX_TOTAL_STORAGE - storageState.totalSize;
}

/**
 * Checks if adding a file would exceed limit
 */
function canAddFile(fileSizeBytes) {
  return (storageState.totalSize + fileSizeBytes) <= MAX_TOTAL_STORAGE;
}


/**
 * Increments storage (queued write)
 */
async function incrementStorage(fileSizeBytes) {
  /* Return a promise that will be resolved/rejected when 
  the operation is done */
  return new Promise((resolve, reject) => {
    // Push the operation object to the queue

    writeQueue.push({
      storage_writing_operation: async () => {
        // Increment storage size
        storageState.totalSize += fileSizeBytes;
        storageState.lastUpdated = new Date().toISOString();
        
        // save the updated state to storage-state.json file
        await saveToFile();
      },
      resolve,
      reject
    });

    processQueue();
  });
}

/**
 * Decrements storage (queued write)
 */
async function decrementStorage(fileSizeBytes) {
  return new Promise((resolve, reject) => {

    // Push the operation object to the queue
    writeQueue.push({
      storage_writing_operation: async () => {
          // Calculate new total
            const newTotal = storageState.totalSize - fileSizeBytes;
            
            // Flag potential bug if decrement would go negative
            if (newTotal < 0) {
              console.warn(
                ` Storage decrement would go negative!!!!\n` +
                `   Current: ${storageState.totalSize} bytes\n` +
                `   Trying to decrement: ${fileSizeBytes} bytes\n` +
                `   This suggests a bug in file deletion tracking.`
              );
            }
            // Decrement storage size, ensuring it doesn't go below zero (edge case)
            storageState.totalSize = Math.max(0, newTotal);
            storageState.lastUpdated = new Date().toISOString();

            // save the updated state to storage-state.json file
            await saveToFile();
      },
      resolve,
      reject

    });

    processQueue();
  });
}

/**
 * Internal: Persist state to disk
 */
async function saveToFile() {
  // ensure data directory exists
  const dataDir = path.dirname(STORAGE_STATE_FILE);
  if (!fsSync.existsSync(dataDir)) {
    fsSync.mkdirSync(dataDir, { recursive: true });
  }
  
  // if old file exists delete it
  if (fsSync.existsSync(STORAGE_STATE_FILE)) {
    fsSync.unlinkSync(STORAGE_STATE_FILE);
  }

  await fs.writeFile(
    STORAGE_STATE_FILE,
    JSON.stringify(storageState, null, 2),
    'utf-8'
  );
}

/**
 * Reset state (testing/recovery)
 */
async function reset() {
  return new Promise((resolve, reject) => {

    // Push the operation object to the queue
    writeQueue.push({
      storage_writing_operation: async () => {
        // Reset in-memory state
        storageState = { totalSize: 0, lastUpdated: new Date().toISOString() };

        // save the reset state to storage-state.json file
        await saveToFile();
        console.log(' Storage state has been reset');
      },
      resolve,
      reject
    });

    // Process the write queue
    processQueue();
  });
}


export  {
  getState,
  incrementStorage,
  decrementStorage,
  canAddFile,
  getAvailableStorage,
  reset,
  initialize_storage_state,
  createNewStateFile
};