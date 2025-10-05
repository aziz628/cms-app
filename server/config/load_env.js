// config/load-env.js
import dotenv from 'dotenv';
import build_env_path from '../utils/build_env_path.js';

const env = process.env.NODE_ENV || 'development';
const env_path = build_env_path(env);

if (env !== 'test') {
    console.log(`Running from load_env. Current environment: ${env}`);
}
dotenv.config({ path: env_path });

