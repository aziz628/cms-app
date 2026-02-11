
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import db from '../DB/db_connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define backup directory
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../data/backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

let backupTask = null;

// Function to perform the backup
const performBackup = async () => {
    const backupFile = path.join(BACKUP_DIR, `backup-${getDateTime()}.sqlite`);

    console.log(`[Backup] Starting backup to: ${backupFile}`);

    try {
        //sqlite keep empty space ("freelist") in the file when it delete data ,so it be reused. 
        // with vacuum it does "atomic" backup , shrink the database removing empty space
        // before writing to file .
        await db.run(`VACUUM INTO '${backupFile}'`);
        console.log(`[Backup] detailed db snapshot created successfully.`);

        // Clean up old backups (keep last 7 days)
        await cleanOldBackups();
    } catch (error) {
        console.error(`[Backup] Failed:`, error);
    }
};

function getDateTime() {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // 2026-02-10
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // 02-17-51
  return `${date}_${time}`;
}

// Function to clean old backups
const cleanOldBackups = async () => {
    try {
        // get all files in the backup directory
        const files = fs.readdirSync(BACKUP_DIR);
        const now = Date.now();
        const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        // delete files older than 7 days
        for (const file of files) {
            if (!file.endsWith('.sqlite')) continue;

            const filePath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filePath);
            
            // delete files older than 7 days
            if (now - stats.mtimeMs > MAX_AGE_MS) {
                fs.unlinkSync(filePath);
                console.log(`[Backup] Deleted old backup: ${file}`);
            }
        }
    } catch (error) {
        console.error(`[Backup] Cleanup failed:`, error);
    }
};

// Initialize the backup service
export const initBackupService = () => {
    // Schedule: Run every 3 days at 3:00 AM
    // Cron syntax: Minute Hour Day Month DayOfWeek
    const schedule = process.env.BACKUP_SCHEDULE || '0 3 */3 * *';

    console.log(`[Backup] Service initialized. Schedule: ${schedule}`);

    backupTask = cron.schedule(schedule, performBackup);
};

// Stop the backup service
export const stopBackupService = () => {
    if (backupTask) {
        console.log('[Backup] Stopping scheduled task...');
        backupTask.stop();
        backupTask = null;
    }
};

// Manual trigger (useful for shutdown)
export const triggerManualBackup = async () => {
    console.log('[Backup] Manual trigger received.');
    await performBackup();
};
