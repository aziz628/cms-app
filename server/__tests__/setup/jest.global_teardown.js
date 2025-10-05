import migrate from '../../DB/migrate.js';
import { cleanup_all_upload } from '../helper/tools.js';

export default async function globalTeardown() {
  // Undo all migrations and close DB
      console.log("test teardown...");

  if (typeof migrate.undoAll === 'function') {
    await migrate.undoAll();
  }
  if (typeof migrate.close_db === 'function') {
    await migrate.close_db();
  }
  // Final cleanup
  cleanup_all_upload();
}