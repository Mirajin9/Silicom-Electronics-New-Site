// Usage: node scripts/hash-password.js "your-strong-password"
// Prints a bcrypt hash to paste into ADMIN_HASH in your .env.
const bcrypt = require('bcryptjs');
const pw = process.argv[2];
if (!pw) {
  console.error('Usage: node scripts/hash-password.js "your-password"');
  process.exit(1);
}
console.log(bcrypt.hashSync(pw, 10));
