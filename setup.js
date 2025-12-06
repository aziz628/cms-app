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

      // env example path backend
      const envExamplePath = path.join(SERVER_DIR, '.env.example');
      // env example path frontend
      const envFrontendExamplePath = path.join(FRONTEND_DIR, '.env.example');

      const envProductionPath = path.join(SERVER_DIR, '.env.production');
      const envDevelopmentPath = path.join(SERVER_DIR, '.env.development');

      if (!fs.existsSync(envProductionPath)) {
        fs.copyFileSync(envExamplePath, envProductionPath);
        console.log('\n Created .env.production from .env.example');
      } else {
        console.log('\n .env.production already exists, skipping creation');
      }

      if (!fs.existsSync(envDevelopmentPath)) {
        fs.copyFileSync(envExamplePath, envDevelopmentPath);
        console.log('\nCreated .env.development from .env.example');
      } else {
        console.log('\n.env.development already exists, skipping creation');
      }
     
      // frontend env
      const envFrontendPath = path.join(FRONTEND_DIR, '.env');
      
      if (!fs.existsSync(envFrontendPath)) {
        fs.copyFileSync(envFrontendExamplePath, envFrontendPath);
        console.log('\n Created frontend .env from .env.example');
      } else {
        console.log('\n Frontend .env already exists, skipping creation');
      }
      
  } catch (error) {
    console.error('\n env Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupProject();