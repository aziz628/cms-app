import '../../config/load_env.js';
import migrate from '../../DB/migrate.js';

// import { cleanupAllUploads } from '../helper/tools.js';

console.log("Jest global setup - environment:", process.env.NODE_ENV);

async function globalSetup() {
  // Run all migrations once
  console.log("test setup...");

  if (typeof migrate.runAll === 'function') {
    await migrate.runAll();
  } 

}

export default globalSetup;