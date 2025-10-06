import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting project setup...');

// Configuration
const SERVER_DIR = path.join(__dirname, 'server');
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const UPLOAD_DIRS = ['gallery', 'trainers', 'events', 'reviews', 'classes', 'transformations'];
const UPLOAD_BASE = path.join(SERVER_DIR, 'uploads');

async function setupProject() {
  try {
    // 1. Install dependencies for server and frontend
    console.log('\n Installing dependencies...');
    
    console.log('   Installing server dependencies...');
    execSync('npm ci', { cwd: SERVER_DIR, stdio: 'inherit' });
    
    console.log('   Installing frontend dependencies...');
    execSync('npm ci', { cwd: FRONTEND_DIR, stdio: 'inherit' });
    
    // 2. Setup upload directories
    console.log('\n Creating upload directories...');
    
    if (!fs.existsSync(UPLOAD_BASE)) {
        fs.mkdirSync(UPLOAD_BASE, { recursive: true });
        console.log(`Created base upload directory: ${UPLOAD_BASE}`);
    }

    for (const dir of UPLOAD_DIRS) {
      const dirPath = path.join(UPLOAD_BASE, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created ${dirPath}`);
      }
    }
    
    // 3. Build frontend and copy to server
    console.log('\n Building frontend...');
    execSync('npm run build', { cwd: FRONTEND_DIR, stdio: 'inherit' });
    
    console.log('Copying frontend build to server/dist...');
    const distPath = path.join(SERVER_DIR, 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
    }
    fs.mkdirSync(distPath, { recursive: true });
    
    // Copy frontend build to server/dist
    const frontendDistPath = path.join(FRONTEND_DIR, 'dist');
    fs.cpSync(frontendDistPath, distPath, { recursive: true });
    console.log('Frontend build copied to server/dist');
    
    // 4. Run migrations (sqlite will create the DB file if it doesn't exist)
    console.log('\n Setting up database...');
    console.log('   Running migrations...');
    execSync('npm run migrate', { cwd: SERVER_DIR, stdio: 'inherit' });
    console.log('   Database setup complete');

    console.log('\n Setup completed successfully!');
    console.log('\n IMPORTANT: Create a .env.production file from .env.example before starting the server');
    console.log('\n To start the server:');
    console.log('   cd server');
    console.log('   npm run prod:start');
    
  } catch (error) {
    console.error('\n Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupProject();