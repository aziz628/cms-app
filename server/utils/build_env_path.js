import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

export default function build_env_path(env) {
    const envPath = path.resolve(rootDir, `.env.${env}`);
    // if the file does not exist throw an error and crash the app
    if (!fs.existsSync(envPath)) {
        throw new Error(`Environment file not found: ${envPath}`);
    }
    return envPath;
}
