const bcrypt = require('bcrypt');

const plainPassword = 'MasalaMan1';  // Replace with your input password
const hashedPassword = '$2b$10$53Ms.zBUz6uFJJu6sl37BeQYTYeV5y1f7L1K819H67OJbo6JvXItW';   // Copy from the user document

bcrypt.compare(plainPassword, hashedPassword).then(match => {
  console.log('Password match?', match);
});
