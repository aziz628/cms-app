import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SERVER_DIR = path.join(__dirname, 'server');
const FRONTEND_DIR = path.join(__dirname, 'frontend');

async function setupProject() {
  try {
      console.log('\n Setting up environment files...');

      // env example paths
      const env_example_path = path.join(SERVER_DIR, '.env.example');
      const env_frontend_example_path = path.join(FRONTEND_DIR, '.env.example');

      // generated env paths
      const env_production_path = path.join(SERVER_DIR, '.env.production');
      const env_development_path = path.join(SERVER_DIR, '.env.development');
      const env_frontend_path = path.join(FRONTEND_DIR, '.env');
      
      // generate env files
      generate_env_file(env_production_path, env_example_path);
      generate_env_file(env_development_path, env_example_path);
      generate_env_file(env_frontend_path, env_frontend_example_path);
      
  } catch (error) {
    console.error('\n env Setup failed:', error);
    process.exit(1);
  }
}

// generate env file from example
function generate_env_file(env_path, env_example_path) {
  // if env file does not exist, create it
  if (!fs.existsSync(env_path)) {
    fs.copyFileSync(env_example_path, env_path);
    console.log('\n Created .env from .env.example');
    
  } else {
    console.log('\n .env already exists, skipping creation');
  }
}

// Run the setup
setupProject();