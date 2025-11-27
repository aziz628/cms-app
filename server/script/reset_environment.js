import fs from 'fs';
import path from 'path';
import migrate from '../DB/migrate.js';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOAD_BASE = process.env.UPLOAD_BASE || 'uploads';
const UPLOADS_DIR = path.join(__dirname, '..',  UPLOAD_BASE);
const subfolders = ['gallery', 'trainers', 'events', 'classes', 'reviews', 'transformations', 'general_info'];

/**
 * Reset development environment:
 * - Undo all migrations
 * - Apply all migrations from scratch
 * - Clean and recreate upload folders
 */

async function main() {
    try {
        //  revert all migrations
        await migrate.undoAll();
        //  apply all migrations from scratch
        await migrate.runAll();

        // Clean up all uploads
        if (fs.existsSync(UPLOADS_DIR)) {
            console.log('Cleaning up uploads in folders');

            // remove and recreate upload directories
            fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
            fs.mkdirSync(UPLOADS_DIR);

            subfolders.forEach(folder => {
                const folderPath = path.join(UPLOADS_DIR, folder);
                fs.mkdirSync(folderPath);
            });
        }

        console.log('Development environment reset complete');
    } catch (error) {
        console.error('Error resetting development environment:', error);
        process.exit(1);
    }
}

main();