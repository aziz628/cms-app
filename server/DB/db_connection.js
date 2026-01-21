import sqlite3 from 'sqlite3';//sqlite3 library for database driver 
import { open } from 'sqlite'; // wrapper library to use sqlite3 with promises
import path from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';

// set the path to the database file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..'); // go back one level to reach the server directory
const db_relative_path = process.env.DB_PATH || './DB/db.sqlite';

const db_path = path.resolve(rootDir, db_relative_path);
const dbDir = path.dirname(db_path);

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// open the database connection
const db= await open({
  filename: db_path,
  // driver for the callback-based db operations
  driver: sqlite3.Database
});
await db.run('PRAGMA foreign_keys = ON');


export default db;