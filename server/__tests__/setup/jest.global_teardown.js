import migrate from '../../DB/migrate.js';
import { cleanup_all_upload } from '../helper/tools.js';
import { reset } from '../../services/upload_storage_state_service.js';
export default async function globalTeardown() {
  // Undo all migrations and close DB
      console.log("test teardown...");

  if (typeof migrate.undoAll === 'function') {
    await migrate.undoAll();
  }
  if (typeof migrate.close_db === 'function') {
    await migrate.close_db();
  }
  // Final files cleanup
  cleanup_all_upload();
  
  // Reset upload storage state
  reset();

}