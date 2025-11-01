import  fs from 'fs';
import  path from 'path';
import db from './db_connection.js'; 
import  {fileURLToPath, pathToFileURL} from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NODE_ENV = process.env.NODE_ENV || 'development';

// Paths for migrations folder and status file
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// if env = test add test status file
const STATUS_FILE = NODE_ENV === 'test'
  ? path.join(__dirname, 'migration-status.test.json')
  : path.join(__dirname, 'migration-status.json');

//  -- GETTERS functions --

/**
 * Load migration status from JSON file.
 * Creates the file if it doesn't exist.
 * @returns {Object} status { applied: [] }
 */
function loadStatus() {
  try {
    if (!fs.existsSync(STATUS_FILE)) {
      fs.writeFileSync(STATUS_FILE, JSON.stringify({ applied: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
  } catch (err) {
    console.error("Error loading migration status:", err);
    throw err;
  }
}

/**
 * Get all migration files sorted by name.
 * @returns {string[]} List of migration filenames
 */
function getMigrationFiles() {
  return fs.readdirSync(MIGRATIONS_DIR).sort();
}
/**
 * Get pending migrations by comparing all files with applied ones.
 * @param {Object} status
 * @returns {string[]} Pending migration filenames
 */
function getPendingMigrations(status) {
  const allFiles = getMigrationFiles();
  return allFiles.filter(f => !status.applied.includes(f));
}

/**
 * Show current migration status: applied vs pending.
 */
function showStatus() {
  const status = loadStatus();
  const pending = getPendingMigrations(status);
  console.log('Applied:', status.applied);
  console.log('Pending:', pending);
  return { applied: status.applied, pending };
}

//   -- SETTERS functions --

/**
 * Save updated migration status back to file.
 * @param {Object} status
 */
function saveStatus(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

/**
 * Execute a single migration file in a given direction (up or down).
 * @param {string} file Migration filename
 * @param {string} direction "up" or "down"
 */
async function runMigration(file, direction) {
    const filePath = path.join(MIGRATIONS_DIR, file);

    // Convert file path to a valid file URL for import
    const {default:migration} = await import(pathToFileURL(filePath).toString());
    if(NODE_ENV !== "test") console.log("Migration loaded");

    // Check if the migration has the required function
    if (typeof migration[direction] !== 'function') {
        throw new Error(`Migration ${file} has no ${direction} function`);
    }
    if(NODE_ENV !== "test") console.log(` Running ${direction} on ${file}`);
    await migration[direction](db);
    if(NODE_ENV !== "test") console.log(` Migration ${file} ${direction} completed`);
}

/**
 * Run the next pending migration (one by one).
 */
async function runNext() {
  // Load current status and find pending migrations
  const status = loadStatus();
  const pending = getPendingMigrations(status);
  if (pending.length === 0) {
    console.log(' No pending migrations');
    return;
  }
  // Run the first pending migration
  const next = pending[0];
  await runMigration(next, 'up');
  // Update status
  status.applied.push(next);
  saveStatus(status);
}

/**
 * Run all pending migrations in order.
 */
async function runAll() {
  const status = loadStatus();
  const pending = getPendingMigrations(status);
  if (pending.length === 0) {
    console.log('No pending migrations');
    return;
  }
  console.log(`Running all the migrations`);
  for (const file of pending) {
    await runMigration(file, 'up');
    status.applied.push(file);
    saveStatus(status);
  }
}

/**
 * Undo the last applied migration.
 */
async function undoLast() {
  const status = loadStatus();
  if (status.applied.length === 0) {
    console.log(' No migrations to undo');
    return;
  }
  const last = status.applied.pop();
  await runMigration(last, 'down');
  saveStatus(status);
}

/**
 * Undo all applied migrations in reverse order.
 */
async function undoAll() {
  const status = loadStatus();
  const applied = [...status.applied].reverse();
  if (applied.length === 0) {
    console.log('No migrations to undo');
    return;
  }
  console.log(`Undoing all the migrations`);
  for (const file of applied) {
    await runMigration(file, 'down');
    status.applied.pop();
    saveStatus(status);
  }
}

const close_db=async () => {
        if (db && typeof db.close === 'function'){ 
          await db.close();
         if(process.env.NODE_ENV === 'development') console.log("db closed");
        }
      
    }

// MAIN function
/**
 * CLI Main function - handles user commands.
 */
async function main() {
  const [cmd, option] = process.argv.slice(2);

  if (cmd === 'run' && option === 'all') await runAll();
  else if (cmd === 'run') await runNext();
  else if (cmd === 'undo' && option === 'all') await undoAll();
  else if (cmd === 'undo') await undoLast();
  else if (cmd === 'status') showStatus();
  else {
    console.log(`Usage:
      node migrate.js run          # Run next pending migration
      node migrate.js run all      # Run all pending migrations
      node migrate.js undo         # Undo last migration
      node migrate.js undo all     # Undo all applied migrations
      node migrate.js status       # Show applied and pending migrations`);
  }
}

// Run only when executed directly from the CLI
const isCli = process.argv[1] && (process.argv[1] === fileURLToPath(import.meta.url) );
if (isCli) {
  main()
    .catch(console.error)
    .finally(close_db);
}

export default {
  runAll,
  runNext,
  undoLast,
  undoAll,
  showStatus,
  close_db
}
