import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const saltRounds = 10;
const password = 'password';

try {
  const hash = bcrypt.hashSync(password, saltRounds);
  console.log(`hash: <${hash}> `); // Use this value for ADMIN_PASSWORD_HASH
} catch (err) {
  console.error(err);
}

