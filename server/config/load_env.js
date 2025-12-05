// config/load-env.js
import dotenv from 'dotenv';
import build_env_path from '../utils/build_env_path.js';

// build the path according to the current NODE_ENV
const env = process.env?.NODE_ENV || 'development';
const env_path = build_env_path(env);

if (env !== 'test') {
    console.log(`Current environment: ${env}`);
}

dotenv.config({ path: env_path });

