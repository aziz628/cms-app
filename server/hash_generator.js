import bcrypt from 'bcrypt';
const saltRounds = 10;
const password = 'admin_password';

bcrypt.hash(password, saltRounds, function(err, hash) {
  console.log(`hash: <${hash}> `); // Use this value for ADMIN_PASSWORD_HASH
});
