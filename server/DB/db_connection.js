import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import {fileURLToPath} from 'url';

// set the path to the database file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..'); // go back one level to reach the server directory
const db_relative_path = process.env.DB_PATH || './DB/db.sqlite';
// console.log(' DB_PATH:', db_relative_path,' and running in environment:', process.env.NODE_ENV);

const db_path = path.resolve(rootDir, db_relative_path);

// Use a file-based DB for development or testing

// open the database connection
const db= await open({
  filename: db_path,
  // driver means we are using sqlite3 methods in the promise-based sqlite library
  driver: sqlite3.Database
});
await db.run('PRAGMA foreign_keys = ON');


export default db;