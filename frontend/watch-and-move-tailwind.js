import fs from 'fs/promises';
import { watch } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Get the directory of the current script
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceFile = path.join(__dirname, './tailwind-output/output.css');
const destFile = path.join(__dirname, './src/assets/css/output.css');

/**
 * Initialize the output.css file by copying it from the source to the destination.
 * this is used for manual setup or for automated setup script.
 */
async function init_file() {
    console.log('Initializing output.css file...');
    const sourceexists = await fileExists(sourceFile);
    if (sourceexists) {
        await fs.copyFile(sourceFile, destFile);
        console.log(`Moved output.css at ${new Date().toLocaleTimeString()}`);
    }else{
        console.log('Source file does not exist. Please run the Tailwind CSS compiler first.');
    }
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function startWatching() {
    watch(sourceFile, async () => {
        try {
            // check if file doesn't exist
            console.log('Change detected in output.css, moving file...');
            await fs.copyFile(sourceFile, destFile);
            console.log(`Moved output.css at ${new Date().toLocaleTimeString()}`);
        } catch (err) {
            console.error('Error moving file:', err);
        }
    });
    console.log('Watching for changes in output.css...');
}

async function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);

    // If 'init' or '-i' is provided then initialize the file
    if (args.includes('init') || args.includes('-i')) {
        await init_file();
        return;
    }
    
    // Default behavior: init and watch
    await init_file();
    startWatching();
}

 main()
    .catch(console.error);

