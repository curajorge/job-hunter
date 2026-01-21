const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'jobhunter.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ Database file deleted.');
}

console.log('🔄 Re-initializing...');
require('./migrate');
require('./seed');
