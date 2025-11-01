import  dotenv from 'dotenv';
import create_migration from "../helper/migration_template.js";
import build_env_path from '../../utils/build_env_path.js';

const env = process.env.NODE_ENV || 'development';
const envPath = build_env_path(env);
dotenv.config({path: envPath});


// load the username and password from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD_HASHED || 'password';

// Define the migration for creating the 'users' table
export default create_migration({
    upQueries:[`
                CREATE TABLE IF NOT EXISTS admin (
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
                )`,
                `INSERT INTO admin (username, password) VALUES ('${ADMIN_USERNAME}', '${ADMIN_PASSWORD}')`
               ],
    downQueries:[`DROP TABLE IF EXISTS admin;`] 
});