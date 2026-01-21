import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';


const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..'); 

// Configuration
const SERVER_DIR = path.join(__dirname,"..", 'server');
const FRONTEND_DIR = path.join(__dirname,"..", 'frontend');

async function setup(){
    try{
        console.log('Setting up dev environment...');

        console.log('Creating environment files...');
        // run setup script for creating envs files
        await execAsync(`node setup.js`,{cwd:  ROOT_DIR});

        console.log('Installing npm packages...');
        // use paths const to install npm packages
        await execAsync(`npm ci`, {cwd: SERVER_DIR});
        await execAsync(`npm ci`, {cwd: FRONTEND_DIR});

        console.log('Running database migrations...');
        // run migration using npm migrate in server
        await execAsync(`npm run migrate`, {cwd: SERVER_DIR});

        console.log('Setup completed successfully!');
        console.log('\nYou can now start the dev servers using the run_dev script');
    }
    catch(error){
        console.log(error);
        process.exit(1); // exist with error
    }
}

setup();

