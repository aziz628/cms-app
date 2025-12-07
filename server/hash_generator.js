import bcrypt from 'bcrypt';
const saltRounds = 10;
const password = 'password';

// Synchronous hash generation
try {
  const hash = bcrypt.hashSync(password, saltRounds);
  console.log(`hash: <${hash}> `); // Use this value for ADMIN_PASSWORD_HASH
} catch (err) {
  console.error(err);
}

export const get_hash = () => {
    return bcrypt.hashSync(password, saltRounds);
};