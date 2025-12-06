import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// find current os , windows or linux
const isWindows = process.platform === 'win32';

console.log('Starting project setup...');

// Configuration
const SERVER_DIR = path.join(__dirname, 'server');
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const UPLOAD_DIRS = ['gallery', 'trainers', 'events', 'reviews', 'classes', 'transformations','general_info'];
const UPLOAD_BASE = path.join(SERVER_DIR, 'uploads');

async function setupProject() {
  try {
    // 1. Install dependencies for server and frontend
      console.log('\n Installing dependencies...');
      
      console.log('   Installing server dependencies...');
      execSync('npm install', { cwd: SERVER_DIR, stdio: 'inherit' });
      
      console.log('   Installing frontend dependencies...');
      execSync('npm install', { cwd: FRONTEND_DIR, stdio: 'inherit' });

    
    // 2. Setup upload directories
      console.log('\n Creating upload directories...');
      
      if (!fs.existsSync(UPLOAD_BASE)) {
          fs.mkdirSync(UPLOAD_BASE, { recursive: true });
          console.log(`Created base upload directory: ${UPLOAD_BASE}`);
      }

      for (const dir of UPLOAD_DIRS) {
        const dirPath = path.join(UPLOAD_BASE, dir);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
          console.log(`Created ${dirPath}`);
        }
      }
    
    // 3. compile tailwind and move to src/assets/css
      console.log('   Compiling Tailwind CSS...');
      if (isWindows) {
        execSync('compile_tailwind.bat', { cwd: FRONTEND_DIR, stdio: 'inherit' });
      } else {
        execSync('sh compile_tailwind.sh', { cwd: FRONTEND_DIR, stdio: 'inherit' });
      }
      // run node watch watcher once to move the compiled tailwind to server template folder
      console.log('   Compiling Server Template Tailwind CSS...');
      
      // compile server template tailwind
        if (isWindows) {
        execSync('template_tailwind_compile.bat', { cwd: SERVER_DIR, stdio: 'inherit' });
      } else {
        execSync('sh template_tailwind_compile.sh', { cwd: SERVER_DIR, stdio: 'inherit' });
      }
    
    // 4. make envs out of  env.example 
      console.log('\n Setting up environment files...');
      
      // env example path backend
      const envExamplePath = path.join(SERVER_DIR, '.env.example');
      // env example path frontend
      const envFrontendExamplePath = path.join(FRONTEND_DIR, '.env.example');

      const envProductionPath = path.join(SERVER_DIR, '.env.production');
      const envDevelopmentPath = path.join(SERVER_DIR, '.env.development');
      const envTestPath = path.join(SERVER_DIR, '.env.test');

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
      if (!fs.existsSync(envTestPath)) {
        fs.copyFileSync(envExamplePath, envTestPath);
        console.log('\nCreated .env.test from .env.example');
      } else {
        console.log('\n.env.test already exists, skipping creation');
      }
      // frontend env
      const envFrontendPath = path.join(FRONTEND_DIR, '.env');
      if (!fs.existsSync(envFrontendPath)) {
        fs.copyFileSync(envFrontendExamplePath, envFrontendPath);
        console.log('\n Created frontend .env from .env.example');
      } else {
        console.log('\n Frontend .env already exists, skipping creation');
      }
      

    // 5. Build frontend and copy to server
      console.log('\n Building frontend...');
      execSync('npm run build', { cwd: FRONTEND_DIR, stdio: 'inherit' });
      
      console.log('Copying frontend build to server/dist...');
      const distPath = path.join(SERVER_DIR, 'dist');

      // Remove existing dist if it exists
      if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true });
      }
      fs.mkdirSync(distPath, { recursive: true });
      
      // Copy frontend build to server/dist
      const frontendDistPath = path.join(FRONTEND_DIR, 'dist');
      fs.cpSync(frontendDistPath, distPath, { recursive: true });
      console.log('Frontend build copied to server/dist');

    // 6. Run migrations (sqlite will create the DB file if it doesn't exist)
      console.log('\nSetting up database...');
      console.log('Running migrations...');
      execSync('npm run migrate', { cwd: SERVER_DIR, stdio: 'inherit' });
      console.log('Database setup complete');


    console.log('\nSetup completed successfully!');
    console.log('\nIMPORTANT: Edit your .env.production file  \n ');

    console.log('\nTo start the server:');
    console.log('cd server');
    console.log('npm run prod:start');
  } catch (error) {
    console.error('\nSetup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupProject();